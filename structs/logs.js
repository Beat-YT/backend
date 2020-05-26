module.exports = {
    accounts: data => console.log(`[\x1b[33mAccounts\x1b[0m] ${data}\x1b[0m`),
    fdev: data => console.log(`[\x1b[35mFDev\x1b[0m] ${data}\x1b[0m`),
    error: data => console.error(`\x1b[31m[ERROR] ${data}\x1b[0m`),
    
}