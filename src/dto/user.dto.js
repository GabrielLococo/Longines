class UserDTO {
    constructor(firstName, lastName, role) {
        this.nombre = firstName
        this.apellido = lastName
        // this.email = email
        this.role = role
        // this.last_connection = last_connection
    }
}

module.exports = UserDTO