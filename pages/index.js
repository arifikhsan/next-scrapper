import { useEffect, useState } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';

function Home() {
  const [car, setCar] = useState('');
  const [loading, setLoading] = useState(false);
  const [number, setNumber] = useState('eeb72z');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCar('');
    check();
  };
  const check = async () => {
    setLoading(true);
    // axiosRetry(axios, { retries: 3 });
    axios
      .get(`/api/hello?number=${number}`)
      .then((res) => {
        if (res.status === 200) {
          const info = res.data;
          setCar(info);
        } else {
          setCar(res.data.message);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          if (err.response.status === 422) {
            setCar('failed :( ' + err.response.data.message);
          } else if (err.response.status === 504) {
            setCar('timeout :( please try again');
          } else {
            setCar('failed :( what happen?');
          }
        }
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div>
        <div>
          <p>success: cw21gz, eeb72z</p>
          <p>expired: Lwj88</p>
          <p>failed: abc123</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            name='number'
            type='text'
            defaultValue='eeb72z'
            onChange={(e) => setNumber(e.target.value)}
            placeholder='Insert car number'
          />{' '}
          <button type='submit'> Submit </button>{' '}
        </form>{' '}
        <div> {loading && 'loading...'} </div>{' '}
        <div>
          {' '}
          {!loading && (
            <div>
              <div>result:</div>
              <div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(car)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>{' '}
    </>
  );
}

export default Home;
