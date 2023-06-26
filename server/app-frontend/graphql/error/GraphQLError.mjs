/**
 * *****************************************************************************
 *
 * GraphQL Error
 *
 * *****************************************************************************
 */

import { printError } from './printError.mjs';
import { getLocation } from '../language/index.mjs';

export class GraphQLError extends Error {
  constructor (
    message, 
    nodes, 
    source, 
    positions, 
    path, 
    originalError, 
    extensions
  ) {
    super();
    this.name = 'GraphQLError'

    // Compute list of blame nodes.
    const _nodes = Array.isArray(nodes) 
      ? nodes.length !== 0 ? nodes : undefined 
      : nodes ? [ nodes ] : undefined; 

    // Compute locations in the source for the given nodes/positions.
    let _source = source;

    if (!_source && _nodes) {
      const node = _nodes[0];
      _source = node && node.loc && node.loc.source;
    }

    let _positions = positions;

    if (!_positions && _nodes) {
      _positions = _nodes.reduce(function (list, node) {
        if (node.loc) {
          list.push(node.loc.start);
        }

        return list;
      }, []);
    }

    if (_positions && _positions.length === 0) {
      _positions = undefined;
    }

    let _locations;

    if (positions && source) {
      _locations = positions.map(function (pos) {
        return getLocation(source, pos);
      });
    } else if (_nodes) {
      _locations = _nodes.reduce(function (list, node) {
        if (node.loc) {
          list.push(getLocation(node.loc.source, node.loc.start));
        }

        return list;
      }, []);
    }

    const _extensions = extensions || originalError && originalError.extensions;

    Object.defineProperties(this, {
      message: {
        value: message,
        // By being enumerable, JSON.stringify will include `message` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: true,
        writable: true
      },
      locations: {
        // Coercing falsey values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: _locations || undefined,
        // By being enumerable, JSON.stringify will include `locations` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: Boolean(_locations)
      },
      path: {
        // Coercing falsey values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: path || undefined,
        // By being enumerable, JSON.stringify will include `path` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: Boolean(path)
      },
      nodes: {
        value: _nodes || undefined
      },
      source: {
        value: _source || undefined
      },
      positions: {
        value: _positions || undefined
      },
      originalError: {
        value: originalError
      },
      extensions: {
        // Coercing falsey values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: _extensions || undefined,
        // By being enumerable, JSON.stringify will include `path` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: Boolean(_extensions)
      }
    }); // Include (non-enumerable) stack trace.

    if (originalError && originalError.stack) {
      Object.defineProperty(this, 'stack', {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLError);
    } else {
      Object.defineProperty(this, 'stack', {
        value: Error().stack,
        writable: true,
        configurable: true
      });
  }

  }

  toString() {
    return printError(this);
  }
}
