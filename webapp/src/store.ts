import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { Recorder } from '../../packages/vocal-recorder/src'

export const useRecorder = defineStore('recorder', {
  state: () => ({
    recorder: markRaw(new Recorder())
  })
})
