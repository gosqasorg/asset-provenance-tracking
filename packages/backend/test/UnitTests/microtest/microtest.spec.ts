import { describe, it, expect } from 'vitest';
import { httpTrigger} from '../../../src/functions/';

describe('NotificationSignUpTags', () => {
  it('get response for vaidateNotifications', async () => {
    let response = httpTrigger.validateNotification() 
    console.log(response)
    expect(response).toBe(true)


  });
  


  // currently working on test
  //test 1
  // check with all the correct format
  //test 2
  //check with missing tag selection
  //test 3
  // is values are not arrays 
  //test 4
  //check if array contains numbers or some other weird stuff

});