"use client";

import { Box, Stack, Typography } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useEffect } from "react";

const items = [
  'tomato',
  'salad',
  'onion',
  'pasta'
]

export default function Home() {
  useEffect(() => {
    const updatePantry = async () => {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      docs.forEach((doc) => {
        console.log(doc.id, doc.data())
      })
    }
    updatePantry()
  }, [])
  
  return (
  <Box
    width="100vw"
    height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
  >
    <Box
      border={'1px solid #333'}
    >
      <Box
        width="800px"
        height="100px"
        bgcolor={'#add8e6'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography
          variant={'h2'}
          color={'#333'}
          textAlign={'center'}   
        >
          Pantry Items
        </Typography>
      </Box>
      <Stack
        width="800px"
        height="200px"
        spacing={2}
        overflow={'auto'}
      >
        {items.map((i) => (
          <Box 
            key={i}
            width="100%"
            height="300px"
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
          >
            <Typography
              variant={'h3'}
              color={'#333'}
              textAlign={'center'}
            >
              {
                i.charAt(0).toLocaleUpperCase() + i.slice(1).toLowerCase()
              }
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
  )
}
