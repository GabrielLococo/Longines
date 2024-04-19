const TicketModel = require("../models/ticket.model.js")

class TicketRepository {
  async getTicketById(id) {
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        req.logger.error('Ticket not found')
        return null
      }
      return ticket;
    } catch (error) {
      req.logger.error('error getting ticket. getTicketById', error)
      throw error
    }
  }
}
module.exports = TicketRepository