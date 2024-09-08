// Convert string numbers to actual numbers

convertStringToNumbers = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      convertStringToNumbers(obj[key]);
    } else if (!isNaN(obj[key])) {
      obj[key] = Number(obj[key]);
    }
  }
};

//----------------------------------------------------------------
module.exports = class ApiFeatures {
  //query = Mongoose-Query
  //querySTR = Express QuerySTRING

  constructor(query, querySTR) {
    this.query = query;
    this.querySTR = querySTR;
  }

  filter() {
    // Extract and remove special fields for filtering
    const queryObject = { ...this.querySTR };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObject[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const filters = JSON.parse(queryStr);
    convertStringToNumbers(filters);
    // Build query
    this.query = this.query.find(filters);

    return this;
  }

  sorting() {
    // Sorting
    if (this.querySTR.sort) {
      const sortBy = this.querySTR.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  field_limits() {
    // Field limiting
    if (this.querySTR.fields) {
      const fields = this.querySTR.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    // Pagination
    const page = this.querySTR.page * 1 || 1;
    const limit = this.querySTR.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
