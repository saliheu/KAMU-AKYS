import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAvailableSlots } from '../../store/slices/appointmentSlice';
import { formatDate, formatTime, isToday, isPastDate } from '../../utils/formatters';
import './AppointmentCalendar.css';

const AppointmentCalendar = ({ onSlotSelect, selectedCourt, selectedDate, selectedSlot }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const dispatch = useDispatch();
  const { loading, slots } = useSelector((state) => state.appointments);

  useEffect(() => {
    if (selectedDate && selectedCourt) {
      dispatch(fetchAvailableSlots({
        courtId: selectedCourt.id,
        date: selectedDate
      }));
    }
  }, [selectedDate, selectedCourt, dispatch]);

  useEffect(() => {
    setAvailableSlots(slots || []);
  }, [slots]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date) => {
    if (isPastDate(date)) return;
    onSlotSelect({ date: formatDate(date), slot: null });
  };

  const handleSlotClick = (slot) => {
    if (slot.available && selectedDate) {
      onSlotSelect({ date: selectedDate, slot });
    }
  };

  const isDateSelected = (date) => {
    return selectedDate === formatDate(date);
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="appointment-calendar">
      <div className="calendar-header">
        <button
          onClick={() => navigateMonth(-1)}
          className="calendar-nav-btn"
          aria-label="Önceki ay"
        >
          ←
        </button>
        <h3 className="calendar-title">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="calendar-nav-btn"
          aria-label="Sonraki ay"
        >
          →
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {dayNames.map((dayName) => (
          <div key={dayName} className="calendar-day-header">
            {dayName}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="calendar-day-empty" />;
          }

          const isPast = isPastDate(day);
          const isSelected = isDateSelected(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={isPast}
              className={`calendar-day ${isPast ? 'past' : ''} ${
                isSelected ? 'selected' : ''
              } ${isTodayDate ? 'today' : ''}`}
              aria-label={`${day.getDate()} ${monthNames[day.getMonth()]} tarihini seç`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="time-slots-section">
          <h4 className="time-slots-title">
            {selectedDate} - Uygun Saatler
          </h4>
          
          {loading ? (
            <div className="loading-slots">
              <div className="loading-spinner"></div>
              <span>Uygun saatler yükleniyor...</span>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="time-slots-grid">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.available}
                  className={`time-slot ${!slot.available ? 'unavailable' : ''} ${
                    selectedSlot?.id === slot.id ? 'selected' : ''
                  }`}
                  aria-label={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)} ${
                    slot.available ? 'uygun' : 'dolu'
                  }`}
                >
                  <div className="slot-time">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                  <div className="slot-status">
                    {slot.available ? 'Uygun' : 'Dolu'}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-slots">
              <p>Seçilen tarih için uygun randevu saati bulunmamaktadır.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;