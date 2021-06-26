function isProduction() {
    return process.env.NODE_ENV === "production";
}

module.exports = isProduction;
