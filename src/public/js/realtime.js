const socket = io()

socket.on("products", (data) => {
    renderProducts(data)
})

const renderProducts = (products) => {
    const conteinerProducts = document.getElementById("conteinerProducts")
    conteinerProducts.innerHTML = ""
    
    products.docs.forEach(item => {
        const card = document.createElement("div")
        card.classList.add("card")

        card.innerHTML = ` 
                        <p> ${item.title} </p>
                        <p> ${item.price} </p>
                        <button> Eliminar </button>
                        `

        conteinerProducts.appendChild(card)
        card.querySelector("button").addEventListener("click", ()=> {
            deletingProduct(item._id)
        })
    })
}


const deletingProduct = (id) =>  {
    socket.emit("deletingProduct", id)
}

document.getElementById("btnEnviar").addEventListener("click", () => {
    addingProduct()
})


const addingProduct = () => {
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
    };

    socket.emit("addingProduct", product)
}
