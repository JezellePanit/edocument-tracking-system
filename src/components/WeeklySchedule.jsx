import React from 'react';
import { Box, Typography, Card, Stack, Chip, Divider } from '@mui/material';

const WEEKLY_SCHEDULE = [
  { id: 1, time: '09:00 AM', day: 'Today', title: 'Department Sync', details: 'Conference Room B / Zoom', tasks: ['Present weekly report', 'Discuss budget allocation'], color: '#6366f1' },
  { id: 2, time: '02:30 PM', day: 'Tomorrow', title: 'Project Alpha Review', details: 'Focus on UI/UX deliverables', tasks: ['Review Figma mockups', 'Finalize color palette'], color: '#10b981' },
];

const WeeklySchedule = ({ colors, isDark }) => {
  return (
    <Card sx={{ 
      flex: 1, p: 3, backgroundColor: colors.primary[400], borderRadius: '28px',
      display: 'flex', flexDirection: 'column', boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
    }}>
      <Typography variant="h4" fontWeight="800" mb={1}>Weekly Schedule</Typography>
      <Typography variant="body2" color={colors.grey[400]} mb={3}>Meetings & tasks</Typography>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {WEEKLY_SCHEDULE.map((item) => (
          <Box key={item.id} sx={{ p: 2, mb: 3, borderRadius: '20px', bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fcfcfc", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#eee"}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Chip label={item.day} size="small" sx={{ bgcolor: item.color, color: "#fff", fontWeight: 900, fontSize: '0.6rem' }} />
              <Typography variant="caption" fontWeight="700" color={colors.grey[300]}>{item.time}</Typography>
            </Stack>
            <Typography variant="h6" fontWeight="800">{item.title}</Typography>
            <Typography variant="caption" display="block" color={colors.greenAccent[400]} mb={1.5}>{item.details}</Typography>
            <Divider sx={{ mb: 1.5, opacity: 0.1 }} />
            <Stack spacing={0.5}>
              {item.tasks.map((task, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography variant="body2" color={colors.grey[200]} sx={{ fontSize: '0.75rem' }}>{task}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default WeeklySchedule;