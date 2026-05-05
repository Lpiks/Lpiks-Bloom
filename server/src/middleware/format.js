const sentenceCase = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatFields = (req, res, next) => {
  const fields = ['artist', 'album', 'category'];
  
  fields.forEach(field => {
    if (req.body[field]) {
      req.body[field] = sentenceCase(req.body[field]);
    }
  });
  
  next();
};

module.exports = { formatFields };
