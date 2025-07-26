// This is a utility script to generate a valid bcrypt hash for a password.
// We use this to ensure the hash we put in our database is 100% correct.

const bcrypt = require('bcryptjs');

const plainTextPassword = 'password123';
const saltRounds = 10; // This is a standard value for the salt rounds

bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err) {
        console.error("Error generating salt:", err);
        return;
    }
    bcrypt.hash(plainTextPassword, salt, function(err, hash) {
        if (err) {
            console.error("Error generating hash:", err);
            return;
        }
        console.log('--- NEW BCRYPT HASH ---');
        console.log('Plain Text Password:', plainTextPassword);
        console.log('Your new valid hash is:');
        console.log(hash);
        console.log('-------------------------');
        console.log('Copy the hash string (the long line starting with $2a$) and use it in the SQL update script.');
    });
});
