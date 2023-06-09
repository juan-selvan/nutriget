import styles from './circular.module.css';
import {useState} from 'react';
import { useEffect } from 'react';

export default function CircularProgress({value, limit, type}) {
    const [background, setBackground] = useState(`conic-gradient(#44ff44 0deg, #888888 0deg)`);
    const [unit, setUnit] = useState('');

    
    //Function to convert calories to percentage of max
    const angle = Math.round(value*100/limit)*3.6;

    useEffect(() => {
        if (type == 'Calories') {
            setUnit('kcal');
        }
        else if (type == 'Protein') {
            setUnit('g');
        }

        const newBackground = `conic-gradient(#44ff44 ${angle}deg, #888888 0deg)`;
        setBackground(newBackground);
      }, [angle]);


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{type}</h1>
            <div id="circle" className={styles.circularProgress} style={{background}}>
                <div className={styles.innerCircle}>
                    <h1>{Math.round(value*100/limit)}%</h1>
                </div>
            </div>
            <h5 className={styles.center}>{`${Math.round(value)}/${Math.round(limit)} ${unit}`}</h5>
        </div>
    );
}