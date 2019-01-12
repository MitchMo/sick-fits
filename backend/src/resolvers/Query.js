const { forwardTo } = require('prisma-binding');

const Query = {
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    me(parent, args, ctx, info) {
        //1. Check if there is a current userId
        if(!ctx.request.userId) {
            return null;
        }

        //2. Query the database and return the user 
        //-No need to use async/await because we are returning the promise
        return ctx.db.query.user({
            where: { id: ctx.request.userId }
        }, info);
    },
};

module.exports = Query;
