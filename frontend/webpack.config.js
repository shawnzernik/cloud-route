const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "source-map",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "scripts"),
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "common",
                    chunks: "all",
                },
                src: {
                    test: /[\\/]src[\\/](components|services)[\\/]/,
                    name: "common",
                    chunks: "all",
                    enforce: true,
                },
            },
        },
    },
    entry: {
        login: "./src/tre/pages/login.tsx",
        account: "./src/tre/pages/account.tsx",
        lists: "./src/tre/pages/lists.tsx",
        memberships: "./src/tre/pages/memberships.tsx",
        permissions: "./src/tre/pages/permissions.tsx",
        user: "./src/tre/pages/user.tsx",
        group: "./src/tre/pages/group.tsx",
        securable: "./src/tre/pages/securable.tsx",
        menu: "./src/tre/pages/menu.tsx",
        list: "./src/tre/pages/list.tsx",
        setting: "./src/tre/pages/setting.tsx",
        content: "./src/tre/pages/content.tsx",
        markdown: "./src/tre/pages/markdown.tsx",

        // add app pages
        system: "./src/app/pages/system.tsx",
        adapters: "./src/app/pages/adapters.tsx",
        adapter: "./src/app/pages/adapter.tsx",
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/login.html",
            chunks: ["common", "login"],
            title: "Login"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/account.html",
            chunks: ["common", "account"],
            title: "My Account"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/lists.html",
            chunks: ["common", "lists"],
            title: "List View"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/memberships.html",
            chunks: ["common", "memberships"],
            title: "Memberships"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/permissions.html",
            chunks: ["common", "permissions"],
            title: "Permissions"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/user.html",
            chunks: ["common", "user"],
            title: "User Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/group.html",
            chunks: ["common", "group"],
            title: "Group Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/securable.html",
            chunks: ["common", "securable"],
            title: "Securable Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/menu.html",
            chunks: ["common", "menu"],
            title: "Menu Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/list.html",
            chunks: ["common", "list"],
            title: "List Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/setting.html",
            chunks: ["common", "setting"],
            title: "Setting Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/content.html",
            chunks: ["common", "content"],
            title: "Content Edit"
        }),
        new HtmlWebpackPlugin({
            template: "./src/tre/template.html",
            filename: "../static/tre/pages/markdown.html",
            chunks: ["common", "markdown"],
            title: "Markdown"
        }),

        // add app pages
        new HtmlWebpackPlugin({
            template: "./src/app/template.html",
            filename: "../static/app/pages/system.html",
            chunks: ["common", "system"],
            title: "System"
        }),
        new HtmlWebpackPlugin({
            template: "./src/app/template.html",
            filename: "../static/app/pages/adapters.html",
            chunks: ["common", "adapters"],
            title: "Adapter List"
        }),
        new HtmlWebpackPlugin({
            template: "./src/app/template.html",
            filename: "../static/app/pages/adapter.html",
            chunks: ["common", "adapter"],
            title: "Adapter Edit"
        }),
    ]
};