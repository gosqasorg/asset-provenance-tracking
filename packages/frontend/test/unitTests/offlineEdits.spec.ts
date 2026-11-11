import { describe, expect, it} from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import OfflineEdits from '~/pages/offline-edits.vue';


describe("Dismiss All Edits Button", () => {
  it("Click Button To Open Modal for Dismissing All Edits", async() => {
    // Mount the page directly
    const wrapper = mount(OfflineEdits);

    expect(wrapper.find('#dismiss-all-edits-popup').exists()).toBe(false);
    await wrapper.find('.btn.dismiss.all').trigger('click');
    expect(wrapper.find('#dismiss-all-edits-popup').exists()).toBe(true);
    wrapper.unmount();
    localStorage.clear();
  });

  it("Click Button To Open Modal for Dismissing All Edits and Click `Go Back`", async() => {
    //seed queued stash into localStorage
    localStorage.setItem(
      "gdt-stash-queued", JSON.stringify([
        {key: "abc123",
        data:{
          deviceName: "Queued Test Device",
          description: "queued test for offline"
        }}
      ])
    );

    //seed fulfilled/published stash into localStorage
    localStorage.setItem(
      "gdt-stash-fulfilled", JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );
    // Mount the page directly
    const wrapper = mount(OfflineEdits);

    // checks that queued stash has not changed
    expect(localStorage.getItem("gdt-stash-queued")).toBe(
      (
        JSON.stringify([
          {key: "abc123",
            data:{
              deviceName: "Queued Test Device",
              description: "queued test for offline"
          }}
        ])
      ));

    // checks that fulfilled stash has not changed
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    await wrapper.find('.btn.dismiss.all').trigger('click');
    expect(wrapper.find('#dismiss-all-edits-popup').exists()).toBe(true);

    // checks that fulfilled stash has not changed while modal is opened
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    await wrapper.find('#dismiss-all-edits-popup .popup-buttons').trigger('click'); // Go back button

    expect(wrapper.find('#dismiss-all-edits-popup').exists()).toBe(false); // check that modal is closed

    //get queued stash from localStorage
    expect(localStorage.getItem("gdt-stash-queued")).toBe(
      JSON.stringify([
        {key: "abc123",
        data:{
          deviceName: "Queued Test Device",
          description: "queued test for offline"
        }}
      ])
    );

    //get fulfilled stash from localStorage to check that it still exists
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    wrapper.unmount();
    localStorage.clear();
  });

  it("Click `Dismiss All` clears all edits", async() => {
    //seed queued stash into localStorage
    localStorage.setItem(
      "gdt-stash-queued", JSON.stringify([
        {key: "abc123",
        data:{
          deviceName: "Queued Test Device",
          description: "queued test for offline"
        }}
      ])
    );

    //seed failed stash into localStorage
    localStorage.setItem(
      "gdt-stash-failed", JSON.stringify([
        {key: "fail123",
        data:{
          deviceName: "Failed Test Device",
          description: "failed test for offline"
        }}
      ])
    );

    //seed fulfilled stash into localStorage
    localStorage.setItem(
      "gdt-stash-fulfilled", JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    // checks that queued stash + failed stash is not null
    expect(localStorage.getItem("gdt-stash-queued")).not.toBeNull();
    expect(localStorage.getItem("gdt-stash-failed")).not.toBeNull();
    expect(localStorage.getItem("gdt-stash-fulfilled")).not.toBeNull();

    // Mount the page directly
    const wrapper = mount(OfflineEdits);

    //get queued stash from localStorage
    expect(localStorage.getItem("gdt-stash-queued")).toBe(
      JSON.stringify([
        {key: "abc123",
        data:{
          deviceName: "Queued Test Device",
          description: "queued test for offline"
        }}
      ])
    );

    //get failed stash from localStorage
    expect(localStorage.getItem("gdt-stash-failed")).toBe(
      JSON.stringify([
        {key: "fail123",
        data:{
          deviceName: "Failed Test Device",
          description: "failed test for offline"
        }}
      ])
    );

    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    //open Dismiss All modal
    await wrapper.find('.btn.dismiss.all').trigger('click');
    expect(wrapper.find('#dismiss-all-edits-popup').exists()).toBe(true);

    await wrapper.find('#dismiss-all-edits-popup .btn.confirm-dismiss').trigger('click'); // Dismiss all edits button clicked

    expect(localStorage.getItem("gdt-stash-queued")).toBeNull(); // checks that queued stash is cleared
    expect(localStorage.getItem("gdt-stash-failed")).toBeNull(); // checks that failed stash is cleared
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBeNull(); // checks that fulfilled stash is cleared

    expect(wrapper.find('#dismiss-all-edits-popup').exists()).toBe(false); // check that modal is closed

    wrapper.unmount();
    localStorage.clear();
  });
});

describe("Dismiss Published Edits Button", () => {
  it("Click Button To Open Modal for dismissing published edits and Click `Go Back`", async() => {
    //seed fulfilled stash into localStorage
    localStorage.setItem(
      "gdt-stash-fulfilled", JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );
    // Mount the page directly
    const wrapper = mount(OfflineEdits);

    //get fulfilled stash from localStorage
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    await wrapper.find('.btn.dismiss.published').trigger('click');
    expect(wrapper.find('#dismiss-published-edits-popup').exists()).toBe(true);

    // assert that fulfilled stash is still in localStorage
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    await wrapper.find('#dismiss-published-edits-popup .popup-buttons').trigger('click'); // Go back button

    expect(wrapper.find('#dismiss-published-edits-popup').exists()).toBe(false); // check that modal is closed

    // assert that fulfilled stash is still in localStorage and unchanged
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    wrapper.unmount();
    localStorage.clear();
  });
  
  it("Click `Dismiss all published edits` clears published edits", async() => {
    //seed queued stash into localStorage
    localStorage.setItem(
      "gdt-stash-queued", JSON.stringify([
        {key: "abc123",
        data:{
          deviceName: "Queued Test Device",
          description: "queued test for offline"
        }}
      ])
    );

    //seed failed stash into localStorage
    localStorage.setItem(
      "gdt-stash-failed", JSON.stringify([
        {key: "fail123",
        data:{
          deviceName: "Failed Test Device",
          description: "failed test for offline"
        }}
      ])
    );

    //seed fulfilled stash into localStorage
    localStorage.setItem(
      "gdt-stash-fulfilled", JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    // checks that queued stash + failed stash is not null
    expect(localStorage.getItem("gdt-stash-queued")).not.toBeNull();
    expect(localStorage.getItem("gdt-stash-failed")).not.toBeNull();
    expect(localStorage.getItem("gdt-stash-fulfilled")).not.toBeNull();

    // Mount the page directly
    const wrapper = mount(OfflineEdits);

    //get queued stash from localStorage
    expect(localStorage.getItem("gdt-stash-queued")).toBe(
      JSON.stringify([
        {key: "abc123",
        data:{
          deviceName: "Queued Test Device",
          description: "queued test for offline"
        }}
      ])
    );

    //get failed stash from localStorage
    expect(localStorage.getItem("gdt-stash-failed")).toBe(
      JSON.stringify([
        {key: "fail123",
        data:{
          deviceName: "Failed Test Device",
          description: "failed test for offline"
        }}
      ])
    );
    
    //get fulfilled stash from localStorage
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    //open Dismiss Published edits modal
    await wrapper.find('.btn.dismiss.published').trigger('click');
    expect(wrapper.find('#dismiss-published-edits-popup').exists()).toBe(true);

    await wrapper.find('#dismiss-published-edits-popup .btn.confirm-dismiss').trigger('click'); // Dismiss published edits button clicked

    expect(localStorage.getItem("gdt-stash-queued")).not.toBeNull(); // checks that queued stash exists
    expect(localStorage.getItem("gdt-stash-failed")).not.toBeNull(); // checks that failed stash still exists
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBeNull(); // checks that fulfilled stash is cleared

    wrapper.unmount();
    localStorage.clear();
  });
});

describe("Published/Fulfilled Edit", () => {
  it("Click Button To Open Modal for dismissing a published/fulfilled edit and Click `Go Back`", async() => {
    //seed fulfilled stash into localStorage
    localStorage.setItem(
      "gdt-stash-fulfilled", JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );
    // Mount the page directly
    const wrapper = mount(OfflineEdits);

    await flushPromises(); // wait for any executions to complete before asserting.

    //get fulfilled stash from localStorage
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );
    
    // testing the Dismiss edit button exists
    expect(wrapper.find('.btn.key-buttons.bottom').exists()).toBe(true);
    expect(wrapper.findAll('.btn.key-buttons.bottom')).toHaveLength(1); //should be one button

    await wrapper.find('.btn.key-buttons.bottom').trigger('click');
    expect(wrapper.find('#dismiss-published-edit-popup').exists()).toBe(true);

    // assert that fulfilled stash is still in localStorage
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    await wrapper.find('#dismiss-published-edit-popup .popup-buttons').trigger('click'); // Go back button

    expect(wrapper.find('#dismiss-published-edit-popup').exists()).toBe(false); // check that modal is closed

    // assert that fulfilled stash is still in localStorage and unchanged
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    wrapper.unmount();
    localStorage.clear();
  });
  it("Click `Dismiss a published edit` and dismiss edit", async() => {

    //seed fulfilled stash into localStorage
    localStorage.setItem(
      "gdt-stash-fulfilled", JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    // checks that fulfilled stash is not null
    expect(localStorage.getItem("gdt-stash-fulfilled")).not.toBeNull();

    // Mount the page directly
    const wrapper = mount(OfflineEdits);
    await flushPromises(); // wait for any executions to complete before asserting.
    
    //get fulfilled stash from localStorage
    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      JSON.stringify([
        {key: "fulfilled-test",
        data:{
          deviceName: "Fulfilled Test Device",
          description: "successful test for offline"
        }}
      ])
    );

    // testing that button exists
    expect(wrapper.find('.btn.key-buttons.bottom').exists()).toBe(true);
    expect(wrapper.findAll('.btn.key-buttons.bottom')).toHaveLength(1); //should be one button

    //open a Dismiss edit modal
    await wrapper.find('.btn.key-buttons.bottom').trigger('click');
    expect(wrapper.find('#dismiss-published-edit-popup').exists()).toBe(true);

    await wrapper.find('#dismiss-published-edit-popup .btn.confirm-dismiss').trigger('click'); // Dismiss published edit button clicked

    expect(localStorage.getItem("gdt-stash-fulfilled")).toBe(
      "[]"
    );

    wrapper.unmount();
    localStorage.clear();
  });
});