import React from 'react';
import { Container, Title, Text, Loader } from '@mantine/core';
import classes from './Portfolio.module.css'; // Make sure to create this CSS file

const Portfolio: React.FC = () => {
    return (
        <Container size="lg" className={classes.container}>
            <Title className={classes.title}>Work in Progress</Title>
            <Text className={classes.text}>I am working hard to bring you something amazing!</Text>
            <Loader size="xl" className={classes.loader} />
        </Container>
    );
}

export default Portfolio;
