"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  reviewId: z.string().optional(),
  response: z.string().min(10, {
    message: "Response must be at least 10 characters.",
  }),
  isPublic: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
  responseType: z.enum(["thank", "apology", "clarification", "custom"]),
})

export function CompanyReviewModal({ trigger, reviewToRespond = null }) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewId: reviewToRespond?.id || "",
      response: "",
      isPublic: true,
      notifyCustomer: true,
      responseType: "thank",
    },
  })

  function onSubmit(values) {
    // In a real app, this would send the data to your API
    console.log(values)
    toast({
      title: "Response submitted",
      description: "Your response has been submitted successfully.",
    })
    setOpen(false)
    form.reset()
  }

  function handleResponseTypeChange(value) {
    let templateResponse = ""

    switch (value) {
      case "thank":
        templateResponse =
          "Thank you for your positive feedback! We're delighted to hear you enjoyed our service. Your satisfaction is our top priority, and we look forward to serving you again soon."
        break
      case "apology":
        templateResponse =
          "We sincerely apologize for your experience. This falls short of our standards, and we'd like to make it right. Please contact our customer service team so we can address your concerns personally."
        break
      case "clarification":
        templateResponse =
          "Thank you for your feedback. We'd like to clarify that our standard procedure includes [explanation]. We appreciate your understanding and would be happy to discuss this further if you have any questions."
        break
      default:
        templateResponse = ""
    }

    form.setValue("response", templateResponse)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              {reviewToRespond
                ? `Respond to ${reviewToRespond.customerName}'s review`
                : "Create a response to a customer review"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {reviewToRespond && (
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-muted">
                      <img
                        src={reviewToRespond.customerAvatar || "/placeholder.svg"}
                        alt={reviewToRespond.customerName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{reviewToRespond.customerName}</div>
                      <div className="flex items-center text-yellow-500">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className={`h-4 w-4 ${i < reviewToRespond.rating ? "" : "text-muted"}`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{reviewToRespond.comment}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="responseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Template</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleResponseTypeChange(value)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="thank">Thank You Response</SelectItem>
                        <SelectItem value="apology">Apology Response</SelectItem>
                        <SelectItem value="clarification">Clarification Response</SelectItem>
                        <SelectItem value="custom">Custom Response</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose a template or write a custom response</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="response"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Response</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your response here..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormDescription>Your response will be visible to the customer and other users.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Make response public</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyCustomer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Notify customer by email</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  Submit Response
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
