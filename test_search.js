const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/sobhagya', { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', UserSchema, 'users'); // assuming 'users' collection

  const users = await User.find({ "role":"friend", "name": { $regex: new RegExp("raj", 'i') } }).lean();
  console.log('Found users:', users.length);
  users.forEach(u => {
    console.log(u.name, u.role, u.isVideoCallAllowed, u.language, u.status);
  });

  process.exit(0);
}

test().catch(console.error);
