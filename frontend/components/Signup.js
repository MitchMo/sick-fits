import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const SIGNUP_MUTATION = gql`
    mutation SIGNUP_MUTATION(
        $name: String!
        $email: String!
        $password: String!
    ) {
        signup(
            name: $name
            email: $email
            password: $password
        ) {
            id
            email
            name
        }
    }
`;

class Signup extends Component {

    state = {
        name: '',
        email: '',
        password: '',
    };

    saveToState = (e) => {
        const { name, type, value } = e.target;
        const val = (type === 'number') ? parseFloat(value) : value;
        this.setState({ [name]: val });
    };

    render() {
        return (
            <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
                {(signup, { loading, error }) => (
                    <Form method="post" onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await signup();
                        this.setState({
                            name: '',
                            email: '',
                            password: '',
                        });
                    }}>
                        <Error error={error}/>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Sign Up for an Account</h2>
                            <label htmlFor="name">
                                Name
                                <input type="text" id="name" name="name" placeholder="Name" value={this.state.name} onChange={this.saveToState} required />
                            </label>
                            <label htmlFor="email">
                                Email
                                <input type="email" id="email" name="email" placeholder="Email" value={this.state.email} onChange={this.saveToState} required />
                            </label>
                            <label htmlFor="password">
                                Password
                                <input type="password" id="password" name="password" placeholder="Password" value={this.state.password} onChange={this.saveToState} required />
                            </label>
        
                            <button type="submit">Sign Up!</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        );
    };
};

export default Signup;