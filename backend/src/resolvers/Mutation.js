const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util'); //takes callback based functions, and turns them into promise based functions

const Mutations = {
    async createItem(parent, args, ctx, info) {
        //TODO: Check if they are logged in

        const item = await ctx.db.mutation.createItem({
            data: {
                ...args
            }
        }, info);

        return item;
    },
    updateItem(parent, args, ctx, info) {
        //take a copy of the updates
        const updates = { ...args };

        //remove the id from the updates
        delete updates.id;

        //run the update method
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            },
        }, info);
    },
    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };

        //1. Find the item
        const item = await ctx.db.query.item({ where }, `{ id title }`);

        //TODO
        //2. Check if they own the item

        //3. delete it
        return ctx.db.mutation.deleteItem({ where }, info);
    }, 
    async signup(parent, args, ctx, info) {
        //1. Lower case email to prevent issues later on
        args.email = args.email.toLowerCase();

        //2. Hash the password passed in
        const password = await bcrypt.hash(args.password, parseInt(process.env.SALT_LENGTH, 10));
    
        //3. Create the user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args, //Spreads out args.name, args.email, and args.password
                password: password, //overwrites password passed in from args
                permissions: { set: ['USER'] },
            }
        }, info);

        //4. Create JWT token for the new user since we already have the password
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

        //5. Set the JWT as a cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true, 
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
        });

        //6. Return the user to the browser
        return user;
    },
    //Example of destructuring the args parameter for easier readability
    async signin(parent, { email, password }, ctx, info) {
        //1. Check if a user has that email
        const user = await ctx.db.query.user({ where: { email: email } });

        if(!user) {
            throw new Error(`Invalid email or password.`);
        }

        //2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password);

        if(!valid) {
            throw new Error(`Invalid email or password.`);
        }

        //3. Generate the JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

        //4. Set the cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true, 
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
        });

        //5. Return the user
        return user;
    },
    signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token');

        return { message: 'Successfully Signed Out!' };
    },
    async requestReset(parent, args, ctx, info) {
        //1. Verify it is a real user
        const user = await ctx.db.query.user({ where: { email: args.email } });

        if(!user) {
            throw new Error(`No user found with that email.`);
        }

        //2. Set a reset token and expiry on the user
        const resetToken = (await promisify(randomBytes)(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
        const res = await ctx.db.mutation.updateUser({
            where: { email: args.email },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });

        return { message: 'Thanks!' }

        //TODO!!!
        //3. Email them the reset token
    },
    async resetPassword(parent, { resetToken, password, confirmPassword }, ctx, info) {
        //1. Check if the passwords match
        if(password !== confirmPassword) {
            throw new Error(`Password and Confirm passwords do not match.`);
        }
        
        //2. Verify it is a real reset token
        //3. Make sure token is not expired
        //-Using the users() command becauser user() only lets us search on unique fields
        //-This way we can just grab the first one returned, and we can perform the date comparison
        //for the resetTokenExpiry all at once
        const [user]  = await ctx.db.query.users({
            where: {
                resetToken: resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000
            }
        });

        if(!user) {
            throw new Error(`Your reset token is either invalid or expired.`);
        }

        //4. Hash the new password and verify it isn't the same as the current one
        const newPassword = await bcrypt.hash(password, parseInt(process.env.SALT_LENGTH, 10));

        if(newPassword === user.password) {
            throw new Error(`Password must be different than the current one.`);
        }

        //5. Save the new password to the user and remove resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password: newPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        //6. Generate a new JWT
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

        //7. Set the JWT cookie
        ctx.response.cookie('token', token, {
            httpOnly: true, 
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
        });

        //8. return the user
        return updatedUser;
    },
};

module.exports = Mutations;
