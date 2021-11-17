import { useEffect, useState } from 'react';

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
    fetch('/api/hello?number=' + number) // eeb72z
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
        <div>{!loading && <div>car: {car}</div>}</div>
      </div>
    </>
  );
}

export default Home;
