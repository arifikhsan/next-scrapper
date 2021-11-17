import { useEffect, useState } from 'react';

function Home() {
  const [car, setCar] = useState(0);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    fetch('/api/hello?number=eeb72z')
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
        setCar(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    check();
  }, []);

  return (
    <>
      <div>
        <div>{loading && 'loading...'}</div>
        <div>{!loading && car}</div>
      </div>
    </>
  );
}

export default Home;
