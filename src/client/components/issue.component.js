import { Component, View } from 'angular2/core'
import { FormBuilder, Validators } from 'angular2/common'
import { RouteParams } from 'angular2/router'
import { ipcRenderer } from 'electron'
import JiraService from '../services/jira.service'
import NavService from '../services/nav.service'
import Suggest from './suggest.component'
import '../scss/modules/_issue'

@Component({
  selector: 'issue'
})
@View({
  directives: [Suggest],
  template: require('../templates/issue.template')
})
export default class IssueComponent {
  constructor(jira: JiraService, routeParams: RouteParams, fb: FormBuilder, nav: NavService) {
    this.jira = jira
    this.params = routeParams.params
    this.issue = {}
    this.assignable = []
    this.fb = fb
    this.hideTransitions = true

    nav.show('settings').show('issues')
  }

  getAssignable() {
    const users = []
    for (let i = 0, len = this.assignable.length; i < len; i++) {
      users.push(this.assignable[i].name)
    }
    return users
  }

  assignUser() {
    if (!this.assignForm.valid) return
    const user = this.assignForm.controls.assigned.value
    if (user === this.issue.fields.assignee.name) return
    this.jira.assignUser(this.issue.self, user)
  }

  getPossibleTransitions() {
    let transitions = []
    let len = this.allTransitions.length
    for (let i = 0; i < len; i++) {
      if (this.allTransitions[i].to.id !== this.issue.fields.status.id) {
        transitions.push(this.allTransitions[i])
      }
    }
    return transitions
  }

  doTransition(iId, t) {
    this.jira.doTransition(iId, t.id)
    this.issue.fields.status = t.to
    this.transitions = this.getPossibleTransitions()
  }

  ngOnInit() {
    this.jira.issue$.subscribe(issue => this.issue = issue)
    this.jira.getIssue(this.params.issueId)
    this.assignable = this.jira.getAssignable(this.issue.key)
    this.allTransitions = this.jira.getTransitions(this.issue.key).transitions
    this.transitions = this.getPossibleTransitions()

    this.assignForm = this.fb.group({
      assigned: [this.issue.fields.assignee.name, Validators.required]
    })
  }
}
