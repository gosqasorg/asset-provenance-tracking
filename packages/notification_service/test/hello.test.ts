import { HttpRequest, InvocationContext } from '@azure/functions';
import { expect, test } from "@jest/globals";
import { Hello } from '../src/functions/hello';


test('Hello', async () => {
    const context = new InvocationContext({ functionName: 'health' });
    const request = new HttpRequest({
        url: 'http://localhost/hello',
        body: {string: 'There'},
        method: 'POST',
    });
    const expected = { "body": "Hello, There!" }
    const response = await Hello(request, context)
    expect(response).toStrictEqual(expected);
});
