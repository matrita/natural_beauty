import { useMemo, useState, useRef, useEffect } from 'react';

export default function VisualCalendar({ items, da, onDaChange, onAChange, onStatoChange, onDelete, STATI }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);

  // Chiudi il picker se si clicca fuori
  useEffect(() => {
    function handleClickOutside(event) {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calcola i giorni del mese visualizzato (basato sulla data 'da')
  const calendarDays = useMemo(() => {
    const startDate = new Date(da);
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Trova il lunedì della settimana in cui cade il primo giorno del mese
    let startGrid = new Date(firstDay);
    const dayOfWeek = startGrid.getDay() === 0 ? 6 : startGrid.getDay() - 1; // 0=Lunedì, ..., 6=Domenica
    startGrid.setDate(startGrid.getDate() - dayOfWeek);

    // Crea la griglia di 42 giorni (6 settimane) per mantenere sempre la stessa struttura
    const grid = [];
    let current = new Date(startGrid);
    for (let i = 0; i < 42; i++) {
      grid.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { year, month, grid, firstDay, lastDay };
  }, [da]);

  // Raggruppa gli appuntamenti per giorno (usando la stringa 'YYYY-MM-DD' locale)
  const itemsByDay = useMemo(() => {
    const map = new Map();
    
    const getDateString = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    calendarDays.grid.forEach(d => map.set(getDateString(d), []));

    (items || []).forEach(item => {
      const itemDate = new Date(item.dataOraInizio);
      const dayKey = getDateString(itemDate);
      if (map.has(dayKey)) {
        map.get(dayKey).push(item);
      }
    });

    map.forEach(list => {
      list.sort((a, b) => new Date(a.dataOraInizio) - new Date(b.dataOraInizio));
    });

    return map;
  }, [items, calendarDays]);

  function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatoColor(stato) {
    switch (stato) {
      case 'PRENOTATO': return { bg: '#fffbf0', border: '#ffe57f', text: '#b28704', accent: '#ffc107' }; 
      case 'CONFERMATO': return { bg: '#f1f8e9', border: '#c8e6c9', text: '#2e7d32', accent: '#4caf50' };
      case 'COMPLETATO': return { bg: '#e3f2fd', border: '#bbdefb', text: '#1565c0', accent: '#2196f3' };
      case 'CANCELLATO': return { bg: '#ffebee', border: '#ffcdd2', text: '#c62828', accent: '#f44336' };
      default: return { bg: '#fafafa', border: '#eeeeee', text: '#616161', accent: '#9e9e9e' };
    }
  }

  const getDateString = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  
  const toDateTimeLocalValue = (d = new Date()) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const changeMonth = (offset) => {
    const currentDa = new Date(da);
    const newMonthDa = new Date(currentDa.getFullYear(), currentDa.getMonth() + offset, 1);
    const newMonthA = new Date(currentDa.getFullYear(), currentDa.getMonth() + offset + 1, 0, 23, 59, 59);
    
    if (onDaChange && onAChange) {
      onDaChange(toDateTimeLocalValue(newMonthDa));
      onAChange(toDateTimeLocalValue(newMonthA));
    }
  };

  const goToToday = () => {
    const now = new Date();
    const newMonthDa = new Date(now.getFullYear(), now.getMonth(), 1);
    const newMonthA = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    if (onDaChange && onAChange) {
      onDaChange(toDateTimeLocalValue(newMonthDa));
      onAChange(toDateTimeLocalValue(newMonthA));
    }
  };

  const selectSpecificMonth = (year, monthIndex) => {
    const newMonthDa = new Date(year, monthIndex, 1);
    const newMonthA = new Date(year, monthIndex + 1, 0, 23, 59, 59);
    if (onDaChange && onAChange) {
      onDaChange(toDateTimeLocalValue(newMonthDa));
      onAChange(toDateTimeLocalValue(newMonthA));
    }
    setShowMonthPicker(false);
  };

  const [pickerYear, setPickerYear] = useState(new Date(da).getFullYear());

  const handlePickerYearChange = (offset) => {
    setPickerYear(prev => prev + offset);
  };

  // Vista Dettaglio Giorno
  if (selectedDay) {
    const dayKey = getDateString(selectedDay);
    const dayItems = itemsByDay.get(dayKey) || [];
    
    return (
      <div className="calendar-detail" style={{ animation: 'modalIn 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--brand)', marginBottom: '0.2rem' }}>
              {selectedDay.getDate()} {mesi[selectedDay.getMonth()]} {selectedDay.getFullYear()}
            </h3>
            <div style={{ color: 'var(--muted)' }}>
              {dayItems.length === 0 ? 'Nessun appuntamento' : `${dayItems.length} appuntamenti previsti`}
            </div>
          </div>
          <button 
            onClick={() => setSelectedDay(null)}
            className="btn"
            style={{ padding: '0.5rem 1rem' }}
          >
            ← Torna al mese
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {dayItems.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: '#fafafa', borderRadius: '12px', border: '1px dashed #e0e0e0' }}>
              Giornata libera, nessun appuntamento registrato.
            </div>
          )}
          
          {dayItems.map(ap => {
            const colors = getStatoColor(ap.stato);
            return (
              <div 
                key={ap.id} 
                style={{ 
                  backgroundColor: 'white',
                  border: `1px solid ${colors.border}`,
                  borderLeft: `5px solid ${colors.accent}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ 
                    background: colors.bg, 
                    color: colors.text, 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '8px', 
                    fontWeight: '700',
                    fontSize: '1.2rem',
                  }}>
                    {formatTime(ap.dataOraInizio)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', background: '#f5f5f5', padding: '0.3rem 0.8rem', borderRadius: '100px', fontWeight: '600' }}>
                    ⏱️ {ap.trattamentoDurataMinuti} min
                  </span>
                </div>
                
                <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '1.2rem', marginBottom: '1rem' }}>
                  {ap.trattamentoNome}
                </div>
                
                <div style={{ fontSize: '0.95rem', color: 'var(--text)', background: '#fcfcfc', padding: '1rem', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '28px', height: '28px', background: '#e0e0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div> 
                    <span style={{ fontWeight: '600' }}>{ap.clienteNomeCompleto}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '28px', height: '28px', background: 'rgba(139, 168, 142, 0.1)', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💅</div> 
                    <span>{ap.operatoreNomeCompleto}</span>
                  </div>
                </div>

                {ap.note && (
                  <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#fff9e6', borderLeft: '3px solid #ffd54f', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--muted)' }}>
                    {ap.note}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <select 
                    value={ap.stato} 
                    onChange={(e) => onStatoChange(ap.id, e.target.value)}
                    style={{ 
                      fontSize: '0.85rem', 
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      fontWeight: '700',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {STATI.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  
                  <button 
                    type="button" 
                    onClick={() => onDelete(ap.id)}
                    className="btn btn--small btn--danger"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista Mese (Griglia)
  return (
    <div className="calendar-month">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Controlli navigazione calendario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          <div style={{ position: 'relative' }} ref={monthPickerRef}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '0.2rem', 
              boxShadow: 'var(--shadow-sm)' 
            }}>
              <button 
                type="button"
                onClick={() => changeMonth(-1)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '0.5rem 0.8rem', 
                  fontSize: '1.4rem', 
                  color: 'var(--brand)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 168, 142, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Mese precedente"
              >
                ‹
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setPickerYear(calendarDays.year);
                  setShowMonthPicker(!showMonthPicker);
                }}
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--brand)',
                  fontWeight: '700',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  background: showMonthPicker ? 'rgba(139, 168, 142, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '0.6rem 1.2rem',
                  transition: 'background 0.2s',
                  minWidth: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
                onMouseEnter={(e) => !showMonthPicker && (e.currentTarget.style.background = 'rgba(139, 168, 142, 0.05)')}
                onMouseLeave={(e) => !showMonthPicker && (e.currentTarget.style.background = 'transparent')}
              >
                {mesi[calendarDays.month]} {calendarDays.year}
                <span style={{ fontSize: '0.8rem', opacity: 0.6, transform: showMonthPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
              </button>
              
              <button 
                type="button"
                onClick={() => changeMonth(1)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '0.5rem 0.8rem', 
                  fontSize: '1.4rem', 
                  color: 'var(--brand)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 168, 142, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Mese successivo"
              >
                ›
              </button>
            </div>

            {/* Popup Custom per Scelta Mese/Anno - Stile Raffinato */}
            {showMonthPicker && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.8rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                border: '1px solid #eaeaea',
                borderRadius: '20px',
                padding: '1.2rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)',
                zIndex: 100,
                width: '320px',
                animation: 'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {/* Triangolino che punta verso l'alto */}
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '12px',
                  height: '12px',
                  background: 'white',
                  borderLeft: '1px solid #eaeaea',
                  borderTop: '1px solid #eaeaea',
                }}></div>

                {/* Header Selezione Anno Minimalista */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f5f5f5' }}>
                  <button 
                    type="button"
                    onClick={() => handlePickerYearChange(-1)}
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid transparent', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      color: 'var(--brand)', 
                      fontSize: '1.2rem', 
                      borderRadius: '8px',
                      transition: 'all 0.2s ease' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fbf9'; e.currentTarget.style.border = '1px solid #e0e0e0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; }}
                  >
                    ‹
                  </button>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {pickerYear}
                  </div>
                  <button 
                    type="button"
                    onClick={() => handlePickerYearChange(1)}
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid transparent', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      color: 'var(--brand)', 
                      fontSize: '1.2rem', 
                      borderRadius: '8px',
                      transition: 'all 0.2s ease' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fbf9'; e.currentTarget.style.border = '1px solid #e0e0e0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; }}
                  >
                    ›
                  </button>
                </div>

                {/* Griglia Mesi Minimalista */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {mesi.map((m, index) => {
                    const isSelected = pickerYear === calendarDays.year && index === calendarDays.month;
                    const isCurrentMonth = pickerYear === new Date().getFullYear() && index === new Date().getMonth();
                    
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => selectSpecificMonth(pickerYear, index)}
                        style={{
                          background: isSelected ? 'var(--brand)' : 'transparent',
                          color: isSelected ? 'white' : (isCurrentMonth ? 'var(--brand)' : 'var(--text)'),
                          border: isSelected ? '1px solid var(--brand)' : '1px solid transparent',
                          borderRadius: '10px',
                          padding: '0.6rem 0',
                          fontSize: '0.9rem',
                          fontWeight: isSelected ? '600' : (isCurrentMonth ? '700' : '400'),
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={e => {
                          if(!isSelected) {
                            e.currentTarget.style.background = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={e => {
                          if(!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {m.substring(0,3)}
                        {isCurrentMonth && !isSelected && (
                          <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--brand)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={goToToday}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '10px', 
              background: 'rgba(139, 168, 142, 0.1)', 
              color: 'var(--brand)', 
              border: 'none', 
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 168, 142, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 168, 142, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Oggi
          </button>
        </div>
        
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', background: '#f5f5f5', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
          💡 Clicca su un giorno per vedere i dettagli
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '0.5rem',
        background: 'var(--card)',
        padding: '1rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflowX: 'auto',
        minWidth: '500px'
      }}>
        {/* Intestazione giorni settimana */}
        {giorniSettimana.map(g => (
          <div key={g} style={{ 
            textAlign: 'center', 
            fontWeight: '700', 
            color: 'var(--brand)', 
            padding: '0.5rem',
            fontSize: '0.9rem',
            borderBottom: '2px solid rgba(139, 168, 142, 0.2)',
            marginBottom: '0.5rem'
          }}>
            {g}
          </div>
        ))}

        {/* Celle giorni */}
        {calendarDays.grid.map((day, index) => {
          const dayKey = getDateString(day);
          const dayItems = itemsByDay.get(dayKey) || [];
          const isCurrentMonth = day.getMonth() === calendarDays.month;
          const isToday = dayKey === getDateString(new Date());
          const isHovered = hoveredDay === dayKey;

          return (
            <div 
              key={index}
              onClick={() => isCurrentMonth && setSelectedDay(day)}
              onMouseEnter={() => setHoveredDay(dayKey)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{ 
                minHeight: '90px',
                padding: '0.4rem',
                border: isToday ? '2px solid var(--brand)' : '1px solid #f0f0f0',
                borderRadius: '10px',
                background: isCurrentMonth ? (isHovered ? '#f9fbf9' : 'white') : '#fafafa',
                opacity: isCurrentMonth ? 1 : 0.4,
                cursor: isCurrentMonth ? 'pointer' : 'default',
                position: 'relative',
                transition: 'all 0.2s',
                transform: isHovered && isCurrentMonth ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered && isCurrentMonth ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem'
              }}>
                <span style={{ 
                  fontWeight: isToday ? '800' : '600', 
                  fontSize: '1rem',
                  color: isToday ? 'var(--brand)' : (isCurrentMonth ? 'var(--text)' : 'var(--muted)'),
                  background: isToday ? 'rgba(139, 168, 142, 0.1)' : 'transparent',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                >
                  {day.getDate()}
                </span>
                
                {dayItems.length > 0 && isCurrentMonth && (
                  <span style={{ 
                    fontSize: '0.65rem', 
                    background: 'var(--brand)', 
                    color: 'white', 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '10px',
                    fontWeight: '700'
                  }}>
                    {dayItems.length}
                  </span>
                )}
              </div>

              {/* Indicatori Appuntamenti (Punti colorati) */}
              {isCurrentMonth && dayItems.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', padding: '0.2rem' }}>
                  {dayItems.slice(0, 8).map(ap => {
                    const colors = getStatoColor(ap.stato);
                    return (
                      <div 
                        key={ap.id} 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: colors.accent,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }} 
                        title={`${formatTime(ap.dataOraInizio)} - ${ap.clienteNomeCompleto}`}
                      />
                    );
                  })}
                  {dayItems.length > 8 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 'bold' }}>+</div>
                  )}
                </div>
              )}

              {/* Anteprima al passaggio del mouse */}
              {isHovered && isCurrentMonth && dayItems.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  marginTop: '0.5rem',
                  background: 'var(--text)',
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '12px',
                  width: 'max-content',
                  maxWidth: '220px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                  animation: 'modalIn 0.2s ease'
                }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.3rem', fontSize: '0.85rem' }}>
                    {day.getDate()} {mesi[day.getMonth()]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {dayItems.slice(0, 5).map(ap => (
                      <div key={ap.id} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', gap: '0.8rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{formatTime(ap.dataOraInizio)}</span>
                        <span style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ap.clienteNomeCompleto.split(' ')[0]}</span>
                      </div>
                    ))}
                    {dayItems.length > 5 && (
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic', marginTop: '0.2rem' }}>
                        + altri {dayItems.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}