import { Link as RouterLink, useLocation } from 'react-router'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'

const menuItems = [
  {
    label: 'Home',
    path: '/',
    icon: HomeOutlinedIcon,
  },
  {
    label: 'Transakcje',
    path: '/transactions',
    icon: ReceiptLongOutlinedIcon,
  },
  {
    label: 'Analyse',
    path: '/analyse',
    icon: BarChartOutlinedIcon,
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: '100%',
        '& .MuiDrawer-paper': {
          position: 'static',
          width: '100%',
          boxSizing: 'border-box',
          minHeight: '100%',
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
          Mamona
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Twoje finanse w jednym miejscu.
        </Typography>
      </Box>

      <Divider />

      <Box component="nav" aria-label="Menu główne" sx={{ p: 1 }}>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  aria-current={
                    location.pathname === item.path ? 'page' : undefined
                  }
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>

                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Drawer>
  )
}
