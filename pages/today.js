import Head from 'next/head'
import Image from 'next/image'
import React, { useState, useEffect } from 'react';
import Link from 'next/link'

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
    const [protein, setProtein] = useState(0);

    const [calorieLimit, setCalorieLimit] = useState(1);
    const [proteinGoal, setProteinGoal] = useState(1);

    //Function to convert calories to percentage of max
    const toPercent = (value, limit) => Math.round(value*100/limit);

    //Getting this user's daily limit
    const getCalorieLimit = async () => {
      const response = await fetch ('/api/getCalories', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })

    const calorie_data = await response.json()
    if (calorie_data.response == 'No calorie limit set') {
      return <Link href='/'>go to settings and set ur calorie limit</Link>
    }
    else {
        return {'calorieLimit': calorie_data.calorieLimit, 'proteinGoal': calorie_data.proteinGoal};
    }
  }

    //Getting this user's meals for today
    const getTodayMeals = (limit) => {
      fetch ('/api/today', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: user.id})
    })
    .then(response => response.json())
    .then(meals => {
        if (meals.response == 'No meals') {
        }
        else {
            //Calculating the total calories, updating state
            console.log(meals)
              const counter_calories = meals.data.calories;
              setCalories(counter_calories); 

              //Calculating the total protein, updating state
              const counter_protein = meals.data.protein;
              setProtein(counter_protein);
            } 
    });
  }
    useEffect(() => {
      const fetchCalories = async () => {
        getCalorieLimit().then(
          data => {
            setCalorieLimit(data.calorieLimit);
            setProteinGoal(data.proteinGoal);
            getTodayMeals(data.calorieLimit);
          });
      }
      fetchCalories();
    }, []);

    
    function Fatty(){
      if (calories > calorieLimit){
        return (
          <div className="comment">You&apos;ve eaten more than enough fatty</div>
        );
      }
      else{
        return(
          <div className="comment">You&apos;ve got {Math.round(calorieLimit-calories)} calories ({100-toPercent(calories, calorieLimit)}%) left to go</div>
        )
      }
    }

  return (
    <>
      <Head>
        <title>Today&apos;s Data</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <div className={styles.center}>
          <h1 className={inter.className}>
            Today&apos;s Data
          </h1>
          <Link className={styles.smallButton}href='/'>Back to home</Link> 
        </div>
        <Fatty/>
        <div className={styles.center}>
          <CircularProgress value={calories} limit={calorieLimit} type="Calories" />
          <CircularProgress value={protein} limit={proteinGoal} type="Protein" />
        </div>    
         
    </>
  )
}
