const {faker} = require('@faker-js/faker')


class FakerUtils { 
    async generateProduct()  {
        return {
            id: faker.database.mongodbObjectId(),
            title: faker.commerce.productName(),
            price: faker.commerce.price(),
            department: faker.commerce.department(),
            stock: parseInt(faker.string.numeric()),
            description: faker.commerce.productDescription(),
            image: faker.image.url()
        }
    }
}


module.exports = FakerUtils