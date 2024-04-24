import eventService from '../services/eventService';

let handleCreateNewEvent = async (req, res) => {
    let message = await eventService.createNewEvent(req.body);
    return res.status(200).json(message);
};
let handleGetAllEvents = async (req, res) => {
    // console.log('id: ', req.query);
    let id = req.query.eventId;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter',
            users: [],
        });
    }
    let events = await eventService.getAllEvents(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        events,
    });
};
module.exports = {
    handleCreateNewEvent: handleCreateNewEvent,
    handleGetAllEvents: handleGetAllEvents,
};
