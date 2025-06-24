import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addSystemNotification } from '../store/slices/notificationSlice';

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (socket?.connected) return;

  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    auth: {
      token: localStorage.getItem('accessToken'),
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket?.emit('join-user', userId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // Document events
  socket.on('document-created', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'document',
      title: 'New Document',
      message: `${data.creator} created a new document: ${data.document.title}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('document-updated', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'document',
      title: 'Document Updated',
      message: `${data.updatedBy} updated document: ${data.document.title}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('document-shared', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'share',
      title: 'Document Shared',
      message: `${data.sharedBy} shared a document with you: ${data.document.title}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('document-locked', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'document',
      title: 'Document Locked',
      message: `${data.lockedBy} locked the document`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('document-unlocked', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'document',
      title: 'Document Unlocked',
      message: `${data.unlockedBy} unlocked the document`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('document-signed', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'signature',
      title: 'Document Signed',
      message: `${data.signedBy} signed the document${data.allSigned ? ' (all signatures collected)' : ''}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  // Workflow events
  socket.on('workflow-created', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'workflow',
      title: 'New Workflow',
      message: `${data.initiator} created a workflow: ${data.workflow.name}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('workflow-updated', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'workflow',
      title: 'Workflow Updated',
      message: `${data.user} ${data.action}d the workflow: ${data.workflow.name}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  socket.on('workflow-cancelled', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'workflow',
      title: 'Workflow Cancelled',
      message: `${data.cancelledBy} cancelled the workflow: ${data.workflow.name}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  // Signature request
  socket.on('signature-requested', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'signature',
      title: 'Signature Requested',
      message: `${data.requestedBy} requested your signature on: ${data.document.title}`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });

  // Version restored
  socket.on('version-restored', (data) => {
    store.dispatch(addSystemNotification({
      id: Date.now().toString(),
      type: 'version',
      title: 'Version Restored',
      message: `${data.restoredBy} restored version ${data.restoredVersion} of the document`,
      timestamp: new Date(),
      read: false,
      data,
    }));
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinDocument = (documentId: string) => {
  socket?.emit('join-document', documentId);
};

export const leaveDocument = (documentId: string) => {
  socket?.emit('leave-document', documentId);
};

export const getSocket = () => socket;