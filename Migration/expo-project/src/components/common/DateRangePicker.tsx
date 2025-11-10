/**
 * Date Range Picker Component
 * Allows selecting start and end dates for stock data queries
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { formatDateForDB } from '@/utils/date/dateUtils';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>(endDate);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const handleDayPress = (day: DateData) => {
    if (!selectedStartDate || isSelectingEnd) {
      // Select end date or reset if end is before start
      if (selectedStartDate && day.dateString >= selectedStartDate) {
        setSelectedEndDate(day.dateString);
        setIsSelectingEnd(false);
        onDateRangeChange(selectedStartDate, day.dateString);
      } else {
        // Reset and start over
        setSelectedStartDate(day.dateString);
        setSelectedEndDate(undefined);
        setIsSelectingEnd(true);
      }
    } else {
      // Select start date
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(undefined);
      setIsSelectingEnd(true);
    }
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    if (selectedStartDate) {
      marked[selectedStartDate] = {
        startingDay: true,
        color: '#1976D2',
        textColor: 'white',
      };
    }

    if (selectedEndDate) {
      marked[selectedEndDate] = {
        endingDay: true,
        color: '#1976D2',
        textColor: 'white',
      };

      // Mark dates in between
      if (selectedStartDate) {
        const start = new Date(selectedStartDate);
        const end = new Date(selectedEndDate);
        const current = new Date(start);
        current.setDate(current.getDate() + 1);

        while (current < end) {
          const dateString = formatDateForDB(current);
          marked[dateString] = {
            color: '#E3F2FD',
            textColor: '#1976D2',
          };
          current.setDate(current.getDate() + 1);
        }
      }
    }

    return marked;
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        markingType="period"
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#757575',
          selectedDayBackgroundColor: '#1976D2',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#1976D2',
          dayTextColor: '#212121',
          textDisabledColor: '#BDBDBD',
          arrowColor: '#1976D2',
          monthTextColor: '#212121',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
