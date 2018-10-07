export function format(model) {
  const ret = {};
  const keys = Object.keys(model);

  keys.forEach((key) => {
    if (key === '_id') {
      ret.id = model._id.toString(); // eslint-disable-line
    } else if (key !== '__v') {
      if (model[key].constructor.name === 'Date') {
        ret[key] = model[key].toISOString();
      } else {
        ret[key] = model[key];
      }
    }
  });

  return ret;
}
