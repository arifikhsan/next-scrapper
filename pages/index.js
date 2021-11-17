import { useEffect, useState } from 'react';

function Home() {
  const [car, setCar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [number, setNumber] = useState('eeb72z');

  const handleSubmit = async (e) => {
    e.preventDefault();
    check();
  };
  const check = async () => {
    setLoading(true);
    function handleErrors(response) {
      if (!response.ok) {
        setCar('failed :(:(');
        throw Error(response.statusText);
      }
      return response;
    }
    fetch('/api/hello?number=' + number) // eeb72z
      .then(handleErrors)
      .then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            setCar(data.data[0]);
          } else {
            setCar(data.message);
          }
        });
      })
      .catch((error) => {
        setCar('failed :(');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    // check();
  }, []);

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            name='number'
            type='text'
            defaultValue='eeb72z'
            onChange={(e) => setNumber(e.target.value)}
            placeholder='Insert car number'></input>
          <button type='submit'>Submit</button>
        </form>
        <div>{loading && 'loading...'}</div>
        <div>{!loading && car}</div>
      </div>
    </>
  );
}

export default Home;
