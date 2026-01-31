
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        const result = await register(username, email, password);
        if (result.error) {
            alert(result.msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.title}>Create Account</Text>

                <TextInput
                    style={styles.input}
                    value={username}
                    placeholder="Username"
                    onChangeText={text => setUsername(text)}
                />

                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Email"
                    onChangeText={text => setEmail(text)}
                />

                <TextInput
                    style={styles.input}
                    value={password}
                    placeholder="Password"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                />

                <Button title="Register" onPress={handleRegister} />

                <View style={styles.row}>
                    <Text>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapper: {
        width: '80%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    row: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
    },
    link: {
        color: 'blue',
    },
});

export default RegisterScreen;
