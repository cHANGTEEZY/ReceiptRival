// import { v } from "convex/values";
// import { mutation } from "./_generated/server";

// export const createSplit = mutation({
//     args: {
//         title: v.string(),
//     },
//     handler: async (ctx, args) => {
//         const split = await ctx.db.insert("splits", {
//             title: args.title,
//         });
//         return split;
//     }
// })