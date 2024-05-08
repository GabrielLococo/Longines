const TicketModel = require("../models/ticket.model.js")
const logger = require("../utils/logger.js");

class TicketRepository {
  async getTicketById(id) {
    try {
      const ticket = await TicketModel.findById(id)
      if (!ticket) {
        logger.error('Ticket not found')
        return null
      }
      return ticket;
    } catch (error) {
      logger.error('error getting ticket. getTicketById', error)
      throw error
    }
  }
}
module.exports = TicketRepository