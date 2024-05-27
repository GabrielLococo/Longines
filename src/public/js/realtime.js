const socket = io()
const role = document.getElementById("role").textContent
const email = document.getElementById("email").textContent

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
                        <p> titulo: ${item.title} </p>
                        <p> descripción: ${item.description} </p>
                        <p> stock: ${item.stock} </p>
                        <p> precio: $${item.price} </p>
                        <p> categoria: ${item.category} </p>
                        <button> Eliminar </button>
                        `

        conteinerProducts.appendChild(card)
        card.querySelector("button").addEventListener("click", () => {
            if (role === "premium" && item.owner === email) {
                deletingProduct(item._id)
            } else if (role === "admin") {
                deletingProduct(item._id)
            } else {
                console.log("you are not allowed to eliminate that product")
            }
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
    const role = document.getElementById("role").textContent
    const email = document.getElementById("email").textContent
    const owner = role === "premium" ? email : "admin"
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
        owner
    }

    socket.emit("addingProduct", product)
}

