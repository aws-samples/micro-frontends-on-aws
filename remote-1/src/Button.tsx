import React, { useState } from 'react';

export const Button = () => {
    const [count, setCount] = useState(0);
    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>Count</button>
        </div>
    );
};

export default Button;
