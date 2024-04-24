import db from '../models/index';
let checkExistEvent = (abnormalType) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.Event.findOne({
                where: { abnormalType: abnormalType },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};
let createNewEvent = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let check = await checkUserAccount(data.account);
            // if (check === true) {
            //     resolve({
            //         errCode: 1,
            //         errMessage: 'Your account is already in used. Please try another account',
            //     });
            // } else {
            // console.log('data.account = ' + data.account);
            await db.Event.create({
                abnormalType: data.abnormalType,
                description: data.description,
            });
            resolve({
                errCode: 0,
                errMessage: 'OK',
            });
            // }
        } catch (e) {
            reject(e);
        }
    });
};
let getAllEvents = (eventId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let events = '';
            if (eventId === 'ALL') {
                events = await db.Event.findAll({
                    attributes: {
                        exclude: [],
                    },
                    order: [['createdAt', 'ASC']],
                });
            }
            if (eventId && eventId !== 'ALL') {
                events = await db.Event.findOne({
                    where: { id: eventId },
                    attributes: {
                        exclude: [],
                    },
                });
            }

            resolve(events);
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    createNewEvent: createNewEvent,
    getAllEvents: getAllEvents,
};
