const { Client } = require('@elastic/elasticsearch');
const logger = require('../utils/logger');

let elasticClient = null;

const connectElasticsearch = async () => {
  try {
    elasticClient = new Client({
      node: process.env.ELASTIC_HOST || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'elastic_password'
      },
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true
    });

    // Test connection
    const health = await elasticClient.cluster.health();
    logger.info('Elasticsearch connected:', health);

    // Create indices if they don't exist
    await createIndices();

    return elasticClient;
  } catch (error) {
    logger.error('Failed to connect to Elasticsearch:', error);
    throw error;
  }
};

const createIndices = async () => {
  const indices = [
    {
      name: 'books',
      mappings: {
        properties: {
          id: { type: 'keyword' },
          title: { 
            type: 'text',
            analyzer: 'turkish',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          description: { type: 'text', analyzer: 'turkish' },
          content: { type: 'text', analyzer: 'turkish' },
          isbn: { type: 'keyword' },
          language: { type: 'keyword' },
          publishYear: { type: 'integer' },
          pageCount: { type: 'integer' },
          authors: { 
            type: 'nested',
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text', analyzer: 'turkish' }
            }
          },
          categories: {
            type: 'nested',
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text', analyzer: 'turkish' }
            }
          },
          publisher: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text', analyzer: 'turkish' }
            }
          },
          tags: { type: 'keyword' },
          rating: { type: 'float' },
          reviewCount: { type: 'integer' },
          borrowCount: { type: 'integer' },
          available: { type: 'boolean' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' }
        }
      },
      settings: {
        analysis: {
          analyzer: {
            turkish: {
              tokenizer: 'standard',
              filter: ['lowercase', 'turkish_stop', 'turkish_stemmer']
            }
          },
          filter: {
            turkish_stop: {
              type: 'stop',
              stopwords: '_turkish_'
            },
            turkish_stemmer: {
              type: 'stemmer',
              language: 'turkish'
            }
          }
        }
      }
    },
    {
      name: 'authors',
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: { 
            type: 'text',
            analyzer: 'turkish',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          biography: { type: 'text', analyzer: 'turkish' },
          birthDate: { type: 'date' },
          deathDate: { type: 'date' },
          nationality: { type: 'keyword' },
          bookCount: { type: 'integer' }
        }
      }
    }
  ];

  for (const index of indices) {
    try {
      const exists = await elasticClient.indices.exists({ index: index.name });
      
      if (!exists) {
        await elasticClient.indices.create({
          index: index.name,
          body: {
            mappings: index.mappings,
            settings: index.settings || {}
          }
        });
        logger.info(`Created Elasticsearch index: ${index.name}`);
      }
    } catch (error) {
      logger.error(`Error creating index ${index.name}:`, error);
    }
  }
};

const getElastic = () => {
  if (!elasticClient) {
    throw new Error('Elasticsearch client not initialized');
  }
  return elasticClient;
};

// Search helper functions
const search = {
  async searchBooks(query, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    const from = (page - 1) * limit;
    
    const body = {
      from,
      size: limit,
      query: {
        bool: {
          must: [],
          filter: []
        }
      },
      highlight: {
        fields: {
          title: {},
          description: {},
          content: { fragment_size: 150, number_of_fragments: 3 }
        }
      }
    };

    // Full text search
    if (query) {
      body.query.bool.must.push({
        multi_match: {
          query,
          fields: ['title^3', 'description^2', 'content', 'authors.name^2'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    // Apply filters
    if (filters.categoryId) {
      body.query.bool.filter.push({
        nested: {
          path: 'categories',
          query: {
            term: { 'categories.id': filters.categoryId }
          }
        }
      });
    }

    if (filters.authorId) {
      body.query.bool.filter.push({
        nested: {
          path: 'authors',
          query: {
            term: { 'authors.id': filters.authorId }
          }
        }
      });
    }

    if (filters.language) {
      body.query.bool.filter.push({
        term: { language: filters.language }
      });
    }

    if (filters.available !== undefined) {
      body.query.bool.filter.push({
        term: { available: filters.available }
      });
    }

    if (filters.publishYear) {
      body.query.bool.filter.push({
        range: {
          publishYear: {
            gte: filters.publishYear.min || 0,
            lte: filters.publishYear.max || new Date().getFullYear()
          }
        }
      });
    }

    // Sorting
    const sortOptions = {
      relevance: ['_score'],
      title: [{ 'title.keyword': sortOrder }],
      year: [{ publishYear: sortOrder }],
      rating: [{ rating: sortOrder }],
      popular: [{ borrowCount: sortOrder }]
    };

    if (sortOptions[sortBy]) {
      body.sort = sortOptions[sortBy];
    }

    try {
      const result = await elasticClient.search({
        index: 'books',
        body
      });

      return {
        total: result.hits.total.value,
        hits: result.hits.hits.map(hit => ({
          ...hit._source,
          _score: hit._score,
          highlights: hit.highlight
        }))
      };
    } catch (error) {
      logger.error('Elasticsearch search error:', error);
      throw error;
    }
  },

  async indexBook(book) {
    try {
      await elasticClient.index({
        index: 'books',
        id: book.id,
        body: book
      });
    } catch (error) {
      logger.error('Elasticsearch index error:', error);
      throw error;
    }
  },

  async updateBook(id, book) {
    try {
      await elasticClient.update({
        index: 'books',
        id,
        body: {
          doc: book
        }
      });
    } catch (error) {
      logger.error('Elasticsearch update error:', error);
      throw error;
    }
  },

  async deleteBook(id) {
    try {
      await elasticClient.delete({
        index: 'books',
        id
      });
    } catch (error) {
      logger.error('Elasticsearch delete error:', error);
      throw error;
    }
  },

  async suggest(query) {
    try {
      const result = await elasticClient.search({
        index: 'books',
        body: {
          suggest: {
            'title-suggest': {
              prefix: query,
              completion: {
                field: 'title.keyword',
                size: 10
              }
            }
          }
        }
      });

      return result.suggest['title-suggest'][0].options;
    } catch (error) {
      logger.error('Elasticsearch suggest error:', error);
      return [];
    }
  }
};

module.exports = {
  connectElasticsearch,
  getElastic,
  search
};