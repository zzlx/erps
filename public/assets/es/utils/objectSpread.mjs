/**
 *
 *
 *
 *
 */

export function objectSpread(target) { 
  for (let i = 1; i < arguments.length; i++) { 
    const source = arguments[i] != null ? arguments[i] : {}; 

    let ownKeys = Object.keys(source); 

    if (typeof Object.getOwnPropertySymbols === 'function') { 
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { 
        return Object.getOwnPropertyDescriptor(source, sym).enumerable; 
      })); 
    } 

    ownKeys.forEach(key => { target[key] = source[key]; }); 
  } 

  return target; 
}
