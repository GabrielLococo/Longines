
class ErrorsInfo {
    productIdNotFound({productId}) {
        return `
        *******************************************
        Product with the id ${productId} was not found. 
        *******************************************`
    }
}

module.exports = ErrorsInfo