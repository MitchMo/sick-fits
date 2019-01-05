const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const password = await bcrypt.hash(args.password, 10); //10 is the length of the salt that bcrypt will be used
    
        //3. Create the user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args, //Spreads out args.name, args.email, and args.password
                password: password, //overwrites password passed in from args
                permissions: { set: ['USER'] },
            }
        }, info);

        //4. Create JWT token for the new user since we already have the password
        const token = jwt.sign({ userId: user.Id }, process.env.APP_SECRET);

        //5. Set the JWT as a cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true, 
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
        });

        //6. Return the user to the browser
        return user;
    }
};

module.exports = Mutations;
