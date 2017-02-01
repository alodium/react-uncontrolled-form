# Formwood

A lightweight and uncomplicated library for building forms and validation with React.

[![npm version](https://badge.fury.io/js/formwood.svg)](https://badge.fury.io/js/formwood)
[![Travis build status](http://img.shields.io/travis/ericvaladas/formwood.svg)](https://travis-ci.org/ericvaladas/formwood)
[![Coverage Status](https://coveralls.io/repos/github/ericvaladas/formwood/badge.svg?branch=master)](https://coveralls.io/github/ericvaladas/formwood?branch=master)
[![Dependency Status](https://david-dm.org/ericvaladas/formwood.svg)](https://david-dm.org/ericvaladas/formwood)
[![devDependency Status](https://david-dm.org/ericvaladas/formwood/dev-status.svg)](https://david-dm.org/ericvaladas/formwood?type=dev)

## Motivation
I wasn't satisfied with the React form validation libraries I could find. I felt they were too complicated or weren't flexible enough for the way I wanted to validate my fields.
I decided to build something that I think is easy to understand, quick to implement, flexible, doesn't do more than it needs to, and an API that felt obvious and familiar.

## Features
- Handles only essential form functionality for you
- Allows multiple validators per field
- Encourages building reusable field components and validators

## Usage

Install the package with npm.
```sh
npm install --save formwood
```

Import the `Field` and `Form` modules.
```js
import {Field, Form} from 'formwood';
```

### Field and Form
`Field` is a higher order component that will add the necessary functionality to your form fields. You must create a component for your input and then wrap the component with `Field`. Then, spread `this.props.element` on your input element. Lastly, use the `Form` component in place of a `form` tag when building your form.

```js
const Input = Field(React.createClass({
  render() {
    return (
      <div className="row">
        <label>{this.props.label}</label>
        <input {...this.props.element}/>
      </div>
    );
  }
}));

const MyForm = React.createClass({
  render() {
    return (
      <Form>
        <Input name="username" type="text" label="Username"/>
      </Form>
    );
  }
});
```
Spreading `this.props.element` on the input element will add all your props, such as `name` and `type`, as well as an `onChange` and `defaultValue` prop. The `onChange` handler will store the value of the input in its state, which is later used for form values and validation. The `defaultValue` prop will set the input with an initial value provided by the `Form`.

**Note: `name` is a required prop as it is the lookup key for the field's value.**

### Form submission
When a form is submitted, all fields will have their validators run. The `onSubmit` event handler is passed an object containing the form's valid status and its values.
```js
const MyForm = React.createClass({
  handleSubmit(e, form) {
    if (form.valid) {
      // Post JSON.stringify(form.values);
    }
  },

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Input name="username" type="text"/>
      </Form>
    );
  }
});
```

### Initial values
You can pass initial values to your fields by adding the `values` prop to the `Form`. 
```js
const MyForm = React.createClass({
  getInitialState() {
    values: {
      firstName: 'Eric',
      lastName: 'Valadas'
    }
  },

  render() {
    return (
      <Form values={this.state.values}>
        <Input name="firstName" type="text"/>
        <Input name="lastName" type="text"/>
      </Form>
    );
  }
});
```

### Validators
Validators are simply functions that return an error message.
```js
function minLength(length) {
  return (value) => {
    if (!value || value.length < length) {
      return `Must be at least ${length} characters`
    }
  };
}

const MyForm = React.createClass({
  render() {
    return (
      <Form>
        <Input name="username" type="text" validators={[minLength(3)]}/>
      </Form>
    );
  }
});
```
The value will be passed to your field component via the `message` prop. If a validator does not return a message, it is considered valid.
```js
const Input = Field(React.createClass({
  render() {
    let classNames = "form-group";
    if (!this.props.valid) {
      classNames += " has-error";
    }
    return (
      <div className={classNames}>
        <label className="control-label" htmlFor={this.props.id}>{this.props.label}</label>
        <input className="form-control" {...this.props.element}/>
        <span className="help-block">{this.props.message}</span>
      </div>
    );
  }
}));
```

### Validation
All fields have a `validate` function that will run through their list of validators. By default, `validate` is only called when the form is submitted. However, this function is passed down as a prop and can be called whenever you like. Here's an example of validating a field as you type.
```js
const Input = Field(React.createClass({
  handleChange(e) {
    this.props.element.onChange(e).then(this.props.validate);
  },

  render() {
    return (
      <div className="row">
        <input {...this.props.element} onChange={this.handleChange}/>
      </div>
    );
  }
}));
```

You can also add field messages to your form which can be useful for things like server-side validation errors after submitting the form.
```js
const MyForm = React.createClass({
  getInitialState() {
    messages: {}
  },

  handleSubmit(e, form) {
    this.setState({
      messages: {username: 'Username already exists'}
    });
  },

  render() {
    return (
      <Form messages={this.state.messages} onSubmit={this.handleSubmit}>
        <Input name="username" type="text"/>
      </Form>
    );
  }
});
```

## API
### Form
You can obtain a `Form` instance by adding a `ref` prop to your form.
```js
render() {
  return (
    <Form ref={(form) => { this.form = form; }}>
      ...
    </Form>
  );
}
```
| Property | Type | Returns | Description |
| --- | --- | --- | --- |
| `fields` | `object` | `object` | `{fieldName: [field, ...], ...}` |
| `getCheckboxValues(fieldName)` | `function` | `Array` | An array of field values |
| `getField(fieldName)` | `function` | `Field instance` | The most recently changed field for the given name |
| `handleSubmit(e)` | `function` | `Promise` | Calls `validate` then calls `props.onSubmit` |
| `invalidFields` | `object` | `object` | `{fieldName: field, ...}` |
| `validate()` | `function` | `Promise` | Calls `validate` on all fields |
| `values()` | `function` | `object` | `{fieldName: fieldValue, ...}` |

| Prop | Description |
| --- | --- |
| [`onSubmit`](#form-submission) | Passes an additional form object argument to your handler<br>`onSubmit(e, {valid: [bool], values: {...}}` |
| [`values`](#initial-values) | An object that contains values for the form's fields |
| [`messages`](#validation) | An object that contains messages for the form's fields |

### Field
These properties are passed down to your field via props.

| Property | Type | Returns | Description |
| --- | --- | --- | --- |
| `handleChange(e)` | `function` | `Promise` | Sets the `value` property of the state |
| `validate()` | `function` | `boolean` | Calls each validator and sets the `valid` and `message` properties of the state |

| Prop | Description |
| --- | --- |
| `element` | Contains essential props (listed below) and any prop you pass to your field |
| `element.defaultChecked` | The initial checked value for the element |
| `element.defaultValue` | The initial value for the element |
| [`element.onChange`](#validation) | The field's `handleChange` function |
| `message` | The message returned by a validator or a form's `values` prop |
| `valid` | The valid property in the field's state. The initial value is `true` |
| `validate` | The field's `validate` function |
| `validators` | An array of validators |
| `value` | The value property in the field's state |

**Note: `name` is a required prop that you must pass to your field as it is the lookup key for the field's value.**

