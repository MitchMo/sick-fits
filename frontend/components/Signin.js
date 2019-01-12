import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
    mutation SIGNIN_MUTATION(
        $email: String!
        $password: String!
    ) {
        signin(
            email: $email
            password: $password
        ) {
            id
            email
            name
            password
        }
    }
`;

class Signin extends Component {

    state = {
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
            <Mutation 
                mutation={SIGNIN_MUTATION} 
                variables={this.state} 
                refetchQueries={[
                    { query: CURRENT_USER_QUERY } //Can also pass in variables if they are needed
                ]}
            >
                {(signin, { loading, error }) => (
                    <Form method="post" onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await signin();
                        this.setState({
                            email: '',
                            password: '',
                        });
                    }}>
                        <Error error={error}/>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Sign into your account</h2>
                            <label htmlFor="email">
                                Email
                                <input type="email" id="email" name="email" placeholder="Email" value={this.state.email} onChange={this.saveToState} required />
                            </label>
                            <label htmlFor="password">
                                Password
                                <input type="password" id="password" name="password" placeholder="Password" value={this.state.password} onChange={this.saveToState} required />
                            </label>
        
                            <button type="submit">Sign In!</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        );
    }
};

export default Signin;