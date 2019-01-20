import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION(
        $email: String!
    ) {
        requestReset(
            email: $email
        ) {
            message
        }
    }
`;

class RequestReset extends Component {

    state = {
        email: '',
    };

    saveToState = (e) => {
        const { name, type, value } = e.target;
        const val = (type === 'number') ? parseFloat(value) : value;
        this.setState({ [name]: val });
    };

    render() {
        return (
            <Mutation 
                mutation={REQUEST_RESET_MUTATION} 
                variables={this.state} 
            >
                {(reset, { loading, error, called }) => (
                    <Form method="post" onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await reset();
                        this.setState({
                            email: '',
                        });
                    }}>
                        <Error error={error}/>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Request a Password Reset</h2>
                            {!error && !loading && called && 
                                <p>Success! Check your email for a password reset link</p>
                            }
                            <label htmlFor="email">
                                Email
                                <input type="email" id="email" name="email" placeholder="Email" value={this.state.email} onChange={this.saveToState} required />
                            </label>
        
                            <button type="submit">Request Reset!</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        );
    }
};

export default RequestReset;