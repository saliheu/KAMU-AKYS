const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const xmlCrypto = require('xml-crypto');
const { Document, User } = require('../models');
const { auth, checkDocumentAccess } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

router.post('/sign/:documentId', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;
    const { certificateData, signatureType = 'standard' } = req.body;

    // Check if user is required to sign
    if (!document.signatureRequiredBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not required to sign this document' });
    }

    // Check if already signed
    if (document.digitallySignedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already signed this document' });
    }

    // Generate signature
    const documentPath = path.join(__dirname, '..', document.fileUrl);
    const documentContent = await fs.readFile(documentPath);
    
    const hash = crypto.createHash('sha256');
    hash.update(documentContent);
    const documentHash = hash.digest('hex');

    const signatureData = {
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      documentId: document.id,
      documentHash,
      signatureType,
      timestamp: new Date().toISOString(),
      certificateData: certificateData || null
    };

    // Create digital signature
    const privateKey = process.env.DIGITAL_SIGNATURE_KEY;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(signatureData));
    const signature = sign.sign(privateKey, 'hex');

    // Update document
    document.digitallySignedBy = [...document.digitallySignedBy, req.user.id];
    document.metadata = {
      ...document.metadata,
      signatures: [
        ...(document.metadata.signatures || []),
        {
          ...signatureData,
          signature
        }
      ]
    };

    // Check if all required signatures are collected
    const allSigned = document.signatureRequiredBy.every(
      userId => document.digitallySignedBy.includes(userId)
    );

    if (allSigned) {
      document.status = 'approved';
      document.metadata.allSignaturesCollected = true;
      document.metadata.signatureCompletedAt = new Date();
    }

    await document.save();

    const io = req.app.get('io');
    io.to(`document-${document.id}`).emit('document-signed', {
      documentId: document.id,
      signedBy: req.user.name,
      allSigned
    });

    res.json({
      message: 'Document signed successfully',
      signature: {
        userId: req.user.id,
        timestamp: signatureData.timestamp,
        verified: true
      },
      allSignaturesCollected: allSigned
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing document', error: error.message });
  }
});

router.get('/verify/:documentId', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    if (!document.metadata?.signatures) {
      return res.json({ 
        verified: false, 
        message: 'No signatures found',
        signatures: []
      });
    }

    const verificationResults = [];
    const publicKey = process.env.DIGITAL_SIGNATURE_KEY; // In production, use proper key management

    for (const sig of document.metadata.signatures) {
      try {
        const signatureData = {
          userId: sig.userId,
          userName: sig.userName,
          userEmail: sig.userEmail,
          documentId: sig.documentId,
          documentHash: sig.documentHash,
          signatureType: sig.signatureType,
          timestamp: sig.timestamp,
          certificateData: sig.certificateData
        };

        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(JSON.stringify(signatureData));
        const isValid = verify.verify(publicKey, sig.signature, 'hex');

        // Verify document integrity
        const documentPath = path.join(__dirname, '..', document.fileUrl);
        const documentContent = await fs.readFile(documentPath);
        const hash = crypto.createHash('sha256');
        hash.update(documentContent);
        const currentHash = hash.digest('hex');
        const documentIntact = currentHash === sig.documentHash;

        verificationResults.push({
          userId: sig.userId,
          userName: sig.userName,
          timestamp: sig.timestamp,
          signatureValid: isValid,
          documentIntact,
          verified: isValid && documentIntact
        });
      } catch (err) {
        verificationResults.push({
          userId: sig.userId,
          userName: sig.userName,
          timestamp: sig.timestamp,
          signatureValid: false,
          documentIntact: false,
          verified: false,
          error: 'Verification failed'
        });
      }
    }

    const allVerified = verificationResults.every(r => r.verified);

    res.json({
      verified: allVerified,
      signatures: verificationResults,
      totalSignatures: verificationResults.length,
      requiredSignatures: document.signatureRequiredBy.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying signatures', error: error.message });
  }
});

router.post('/request/:documentId', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;
    const { userIds, deadline, message } = req.body;

    if (document.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only document creator can request signatures' });
    }

    // Update signature requirements
    document.signatureRequiredBy = [...new Set([...document.signatureRequiredBy, ...userIds])];
    
    if (deadline) {
      document.metadata = {
        ...document.metadata,
        signatureDeadline: deadline
      };
    }

    await document.save();

    // Send notifications
    for (const userId of userIds) {
      const user = await User.findByPk(userId);
      if (user && user.preferences?.notifications?.email) {
        await sendEmail({
          to: user.email,
          subject: `Signature Required: ${document.title}`,
          html: `
            <p>${req.user.name} has requested your signature on a document.</p>
            <p><strong>Document:</strong> ${document.title}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            ${deadline ? `<p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>` : ''}
          `
        });
      }
    }

    const io = req.app.get('io');
    userIds.forEach(userId => {
      io.to(`user-${userId}`).emit('signature-requested', {
        document: {
          id: document.id,
          title: document.title
        },
        requestedBy: req.user.name,
        deadline,
        message
      });
    });

    res.json({ 
      message: 'Signature requests sent successfully',
      signatureRequiredBy: document.signatureRequiredBy
    });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting signatures', error: error.message });
  }
});

router.get('/certificate', auth, async (req, res) => {
  try {
    // In production, integrate with actual certificate authority
    const certificate = {
      subject: {
        CN: req.user.name,
        E: req.user.email,
        O: req.user.department || 'Organization',
        C: 'TR'
      },
      issuer: {
        CN: 'Legal Document Management CA',
        O: 'Government Authority',
        C: 'TR'
      },
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      serialNumber: crypto.randomBytes(8).toString('hex')
    };

    res.json({ certificate });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificate', error: error.message });
  }
});

module.exports = router;