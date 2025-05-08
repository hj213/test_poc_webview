import {MoneytreeWebview, MoneytreeMode} from './MoneytreeWebview';
import {useEffect, useState} from 'react';

const API_URL = 'dev-api.moneytree.bz';
const API_KEY = 'ef5a8f23-ebd4-47cb-a159-118bee406380';

const fetchJwtToken = async () => {
  const response = await fetch(`https://${API_URL}/v1/user/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      uniqueId: 'lumigloo_mason',
      userId: 'lumigloo_mason',
      name: 'lumigloo_mason',
      point: 9999999,
      phoneNumber: '01052286821',
    }),
  });
  const data = await response.json();
  return data.token;
};

export function TestWebview2() {
  const [jwtToken, setJwtToken] = useState<string>('');

  useEffect(() => {
    fetchJwtToken().then(setJwtToken);
  }, []);

  const origin = 'http://10.20.131.30:3000';

  return (
    <MoneytreeWebview
      mode={MoneytreeMode.TEST}
      jwtToken={jwtToken}
      onEventReceived={() => {}}
      onPressedBackInMain={() => {
        console.log('onPressedBackInMain');
      }}
      url={`${origin}/commerce/raffles`}
    />
  );
}
