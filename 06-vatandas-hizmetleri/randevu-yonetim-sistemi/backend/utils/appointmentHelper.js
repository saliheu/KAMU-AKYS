const Appointment = require('../models/Appointment');
const moment = require('moment');

const getAvailableSlots = async (department, service, date) => {
  const dayOfWeek = moment(date).format('dddd').toLowerCase();
  const workingHours = department.workingHours[dayOfWeek];
  
  if (!workingHours || !workingHours.isOpen) {
    return [];
  }
  
  const slots = [];
  const startTime = moment(date).set({
    hour: parseInt(workingHours.start.split(':')[0]),
    minute: parseInt(workingHours.start.split(':')[1])
  });
  
  const endTime = moment(date).set({
    hour: parseInt(workingHours.end.split(':')[0]),
    minute: parseInt(workingHours.end.split(':')[1])
  });
  
  const slotDuration = service.duration || department.appointmentDuration;
  
  // Get existing appointments for the date
  const existingAppointments = await Appointment.find({
    department: department._id,
    date: {
      $gte: moment(date).startOf('day').toDate(),
      $lt: moment(date).endOf('day').toDate()
    },
    status: { $nin: ['cancelled'] }
  });
  
  const bookedSlots = existingAppointments.map(apt => apt.timeSlot.start);
  
  // Generate available slots
  let currentSlot = startTime.clone();
  while (currentSlot.isBefore(endTime)) {
    const slotEnd = currentSlot.clone().add(slotDuration, 'minutes');
    
    if (slotEnd.isSameOrBefore(endTime)) {
      const slotString = currentSlot.format('HH:mm');
      
      if (!bookedSlots.includes(slotString)) {
        slots.push({
          start: slotString,
          end: slotEnd.format('HH:mm'),
          available: true
        });
      }
    }
    
    currentSlot.add(slotDuration, 'minutes');
  }
  
  return slots;
};

const checkSlotAvailability = async (departmentId, date, timeSlot) => {
  const existingAppointment = await Appointment.findOne({
    department: departmentId,
    date: {
      $gte: moment(date).startOf('day').toDate(),
      $lt: moment(date).endOf('day').toDate()
    },
    'timeSlot.start': timeSlot.start,
    status: { $nin: ['cancelled'] }
  });
  
  return !existingAppointment;
};

module.exports = {
  getAvailableSlots,
  checkSlotAvailability
};