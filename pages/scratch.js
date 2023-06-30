import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import styles from 'next/styles/Home.module.css'
import login from 'next/styles/Login.module.css'

import {useState, useEffect} from 'react';
import { useRouter } from 'next/router'
import ReactModal from 'react-modal';
import MainButton from 'next/components/mainButton'
import Ingredients from '../components/ingredients'

import { getSession } from "/session";



const inter = Inter({ subsets: ['latin'] })



export default function New({ session }) {

  
  const { user } = session;
  const [user_id, setUser_id] = useState(user.id);
  const [name, setName] = useState("Unnamed Meal");
  const router = useRouter();

  //Setting state for user input, and other data
  const [foodInput, setFood] = useState();
  const [additional, setAdditional] = useState(false);
  const [calories, setCalories] = useState(0);
  const [data, setData] = useState([]);


    //Modal Setup
    const [modalOpen, setModalOpen] = useState(false);
    const [endModal, setEndModal] = useState(false);

    const closeModal = () => {
    setModalOpen(false);
    };
    if (!session) {
      return <p>You are not logged in</p>;
    }

    const modalStyles = {
      content: {
        alignItems: 'center',
        justifyContent: 'space-evenly',
        display: 'flex',
        width: '50%', // Adjust the width as needed
        borderRadius: '30px',
        maxHeight: '80vh', // Take up less space, adjust the height as needed
        margin: 'auto',
        background: 'rgba(0,0,0)', // Dark background color
      },
      overlay: {
        background: 'rgba(0,0,0, 0.7)', // Dark background color
      },
    }
    

    //Function to remove stuff from food list
    const handleRemove = (event) => {
      const id = Number(event.target.id);
      const newData = data.filter((value) => value.id !== id);
      setData(newData);
    }

    const handleAdd = async (event) => {
      event.preventDefault();
      
      //Set the current date,time
      const date = new Date().toISOString();

      //Send data to the /api/newMeal endpoint
      //Stuff to send: user_id, meal_name, date, data-(array of objects)
      const payload  = {
        user_id: user_id,
        meal_name: name,
        date: date,
        data: data
      }

      const result = await fetch('/api/newMeal', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json'}
      })
      const response = await result.json()
      if (response.response) {
        setModalOpen(false);
        setEndModal(true);
      }


      
      //Have a new green modal pop up (Success! You have added the meal. <Link href="/history">Click here to view your meal history</Link>)
    }
    //Accessing the edamam API with a POST request
    const handleSubmit = async (event) => {

      event.preventDefault(); //Prevent the page from reloading
      let finalInput = ""

      if (event.target.id === 'og'){
        finalInput = foodInput;
      }
      else {
        finalInput = additional;
      }
      
      
      
      const result = await fetch ('/api/getNutrition  ', {
        method: 'POST',
        body: JSON.stringify(finalInput),
        headers: { 'Content-Type': 'application/json'}
      });     

      const response = await result.json();

      if (!additional) {
        setData(response.data)
      }
      else {
        setData(data.concat(response.data)); //If additional, add the new array to the original array to get new_data
      }
      
      //Open the modal
      if (response.data.length > 0 && !modalOpen) {
        setModalOpen(true);
      }
    }
    
  return (
     <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <form>
          <input type="text" placeholder="Enter Food" onChange={(e) => setFood(e.target.value)}></input>
          <button id='og' type ='submit' onClick={handleSubmit}>Submit Food</button>
        </form>
        
        <ReactModal
          isOpen={modalOpen} 
          style={modalStyles}
          >
            <Ingredients data={data} function_on_click={handleRemove}/>
            
            <button onClick={closeModal}>Close</button>
            <div>
              <h4>Missing something? Add it here</h4>
              <form>
                <input type="text" placeholder="Enter Food" onChange={(e) => setAdditional(e.target.value)}></input>
                <button type ='submit' onClick={handleSubmit}>Submit Food</button>
              </form>
              <h4>Name your meal:</h4>
              <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}></input>
              <button
                onClick={handleAdd}
                className={styles.smallButton}
                rel="noopener noreferrer">
                <div>
                  <h1 className={inter.className}>
                      Add
                  </h1>
                </div>
                <div>
                  <Image alt="add meal" width={90} height={90} src='/add_sign.png'></Image>
                </div>    
              </button>
            </div>
        </ReactModal>


        <ReactModal
          isOpen={endModal} 
          style={modalStyles}
          >
            <h1>Success! You have added the meal. <Link href="/history">Click here to view your meal history</Link></h1>
        </ReactModal>
        
      </main>

    </>
    
  );
};
export async function getServerSideProps({ req, res }) {
  const session = getSession(req);
  return { props: { session } };
}
