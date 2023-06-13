import Head from 'next/head'
import Image from 'next/image'
import React, { useState, useEffect } from 'react';

import { Inter } from 'next/font/google'
import styles from 'next/styles/Home.module.css'
import CircularProgress from 'next/components/circular'
import { getSession } from "/session";

const inter = Inter({ subsets: ['latin'] })

export async function getServerSideProps({ req, res }) {
  const { user } = getSession(req) ?? { user: null};
  if (!user) return { redirect: { permanent: false, destination: "/login" } };
  else return { props: { user } };
}

export default function Today( { user } ) {
  
    //Setting the state of calories, so now setCalories updates the calories variable
    const [calories, setCalories] = useState(0);
    const [todayMeals, setMealData] = useState([]);
    //TODO: Getting this user's daily limit (first gotta do onboarding)

    //Getting this user's meals for today
    const getTodayMeals = () => {
      fetch ('/api/today', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: user.id})
    })
    .then(response => response.json())
    .then(meal_data => {
      if (meal_data.response == 'No meals') {
        setMealData("No meals today")
        console.log("SHUSH TING")
      }
      else {
      setMealData(meal_data)
      console.log(todayMeals)

      //Calculating the total calories
      let total = 0;
      for (let i = 0; i < todayMeals.rows.length; i++) {
        total += todayMeals.rows[i].calories;
      }
      setCalories(total);
      console.log(`Total calories: ${calories}`)
    
      }
    });
  }
  useEffect(() => {
  getTodayMeals();
  }, []);

    const max = 2100;

    //Defining a function to convert calories to percentage of max
    const toPercent = (value) => Math.round(value*100/max);
    
    useEffect(() => {
        //Updating the angle of the progress circle, using updated calorie values
        const angle = 3.6 * toPercent(calories);
        
        //Updating the progress circle
        let new_background = `conic-gradient(#44ff44 ${angle}deg, #888888 0deg)`;

        const element = document.getElementById("circle");
        element.style.background = new_background;

        //Red if they exceeded the calories (fatty)
        if (angle > 360) {
          element.style.background = "conic-gradient(#ff4444 360deg, #888888 0deg)";
        }
    });

    function Fatty(){
      if (calories > max){
        return (
          <div className="comment">You've eaten more than enough fatty</div>
        );
      }
      else{
        return(
          <div className="comment">You've got {max-calories} calories ({100-toPercent(calories)}%) left to go</div>
        )
      }
    }

  return (
    <>
      <Head>
        <title>Today's Calories</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <div className={styles.center}>
          <h1 className={inter.className}>
            Today's Calories
          </h1>
        </div>
         
        <div className={styles.center}>

          <CircularProgress percentage={toPercent(calories)} />
          <Fatty></Fatty>
        </div>
         <button></button>
      
    </>
  )
}
